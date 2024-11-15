export enum ErrorCode {
  CODE_COOLDOWN = 'CODE_COOLDOWN',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  CODE_EXPIRED = 'CODE_EXPIRED',
  INVALID_CODE = 'INVALID_CODE',
  INVALID_TOKEN = 'INVALID_TOKEN',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  CUSTOM_NAME_ALREADY_EXISTS = 'CUSTOM_NAME_ALREADY_EXISTS',
  NO_CHANGES_DETECTED = 'NO_CHANGES_DETECTED',
  USER_ALREADY_BLOCKED = 'USER_ALREADY_BLOCKED',
  BLOCK_NOT_FOUND = 'BLOCK_NOT_FOUND',
  CANNOT_BLOCK_SELF = 'CANNOT_BLOCK_SELF',
  CONTACT_NOT_FOUND = 'CONTACT_NOT_FOUND',
  CANNOT_ADD_SELF_AS_CONTACT = 'CANNOT_ADD_SELF_AS_CONTACT',
  CONTACT_ALREADY_EXISTS = 'CONTACT_ALREADY_EXISTS',
  TWILIO_ERROR = 'TWILIO_ERROR',
  CANNOT_ADD_SELF_AS_MEMBER_CHAT = 'CANNOT_ADD_SELF_AS_MEMBER_CONTACT',
  USERS_NOT_FOUND = 'USERS_NOT_FOUND',
  CANNOT_CREATE_CHAT_WITH_BLOCKED_USERS = 'CANNOT_CREATE_CHAT_WITH_BLOCKED_USERS',
  CANNOT_CREATE_CHAT_BY_BLOCKED_USERS = 'CANNOT_CREATE_CHAT_BY_BLOCKED_USERS',
  CHAT_NOT_FOUND = 'CHAT_NOT_FOUND',
  USER_NOT_A_MEMBER_CHAT = 'USER_NOT_A_MEMBER_CHAT',
  CANNOT_CHANGE_SELF_CHAT_MEMBER_ROLE = 'CANNOT_CHANGE_SELF_CHAT_MEMBER_ROLE',
  INSUFFICIENT_PERMISSIONS_CHANGE_CHAT_MEMBER_ROLE = 'INSUFFICIENT_PERMISSIONS_CHANGE_CHAT_MEMBER_ROLE',
  MEMBER_ROLE_NOT_FOUND = 'MEMBER_ROLE_NOT_FOUND',
  INSUFFICIENT_PERMISSIONS_UPDATE_CHAT = 'INSUFFICIENT_PERMISSIONS_UPDATE_CHAT',
}
