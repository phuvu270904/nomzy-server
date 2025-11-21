import { ApiProperty } from "@nestjs/swagger";

export class BulkDeleteUsersDto {
    @ApiProperty({
        example: [1, 2, 3],
        description: "Array of user IDs to be deleted",
    })
  ids: number[];
}