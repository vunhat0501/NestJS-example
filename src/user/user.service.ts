import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async editUser(userId: number, dto: EditUserDto) {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hash, ...userWithOutHash } = user;

    return userWithOutHash;
  }

  async deleteUser(userId: number) {
    const deletedUser = await this.prisma.user.delete({
      where: {
        id: userId,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hash, ...userWithOutHash } = deletedUser;

    return userWithOutHash;
  }
}
