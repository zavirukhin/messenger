import { applyDecorators } from '@nestjs/common';
import { ApiResponse, ApiResponseSchemaHost } from '@nestjs/swagger';

export const ApiMultipleResponse = (...entries: ApiResponseSchemaHost[]) => {
  return applyDecorators(
    ApiResponse({
      status: entries[0].status || 200,
      content: {
        'application/json': {
          schema: entries[0].schema,
          examples: entries.reduce((list, entry) => {
            list[entry.description] = {
              value: entry.schema.example,
            };
            return list;
          }, {}),
        },
      },
    }),
  );
};
