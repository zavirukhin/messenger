import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../../entity/contact.entity';
import { User } from '../../entity/user.entity';
import { UserNotFoundException } from '../../exception/user-not-found.exception';
import { ContactAlreadyExistsException } from '../../exception/contact-already-exists.exception';
import { ContactNotFoundException } from '../../exception/contact-not-found.exception';
import { CannotAddSelfAsContactException } from '../../exception/cannot-add-self-as-contact.exception';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private async findUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new UserNotFoundException();
    }
    return user;
  }

  private async isContactAlreadyExists(
    contactedUser: number,
    contactedByUser: number,
  ): Promise<boolean> {
    const existingContact = await this.contactRepository.findOne({
      where: {
        contactedUser: { id: contactedUser },
        contactedByUser: { id: contactedByUser },
      },
    });
    return !!existingContact;
  }

  private async createContactRecord(
    contactedUser: User,
    contactedByUser: User,
  ): Promise<Contact> {
    const contactRecord = this.contactRepository.create({
      contactedUser,
      contactedByUser,
    });
    return await this.contactRepository.save(contactRecord);
  }

  async addContact(
    contactedUserId: number,
    contactedByUserId: number,
  ): Promise<void> {
    if (contactedUserId === contactedByUserId) {
      throw new CannotAddSelfAsContactException();
    }

    const contactedUser = await this.findUserById(contactedUserId);
    const contactedByUser = await this.findUserById(contactedByUserId);

    const contactExists = await this.isContactAlreadyExists(
      contactedUserId,
      contactedByUserId,
    );
    if (contactExists) {
      throw new ContactAlreadyExistsException();
    }

    await this.createContactRecord(contactedUser, contactedByUser);
  }

  async removeContact(
    contactedUserId: number,
    contactedByUserId: number,
  ): Promise<void> {
    const existingContact = await this.contactRepository.findOne({
      where: {
        contactedUser: { id: contactedUserId },
        contactedByUser: { id: contactedByUserId },
      },
    });

    if (!existingContact) {
      throw new ContactNotFoundException();
    }

    await this.contactRepository.remove(existingContact);
  }

  async getContacts(userId: number): Promise<User[]> {
    const contacts = await this.contactRepository.find({
      where: { contactedByUser: { id: userId } },
      relations: ['contactedUser'],
      select: {
        contactedUser: {
          id: true,
          firstName: true,
          lastName: true,
          avatarBase64: true,
          customName: true,
        },
      },
    });

    return contacts.map((contact) => contact.contactedUser);
  }
}
