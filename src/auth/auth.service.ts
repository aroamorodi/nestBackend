import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>
  ) {}


 async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { password, ...userData} = createUserDto;
      const newUser = new this.userModel({
        password: bcryptjs.hashSync(password, 10), // 1 Encriptar la contraseña
        ...userData
      });

      // 2 Guardar el usuario

      // · Generar el JWT
      await newUser.save();
      const { password:_, ...user} = newUser.toJSON();
      return user;

    } catch (error) {
      console.log(error.code)
      if (error.code === 11000) {
        throw new BadRequestException(`${createUserDto.email} already exists!!`)
      }
      throw new InternalServerErrorException('Something terrible happen!!')
    }
    
  }


  async login( loginDto: LoginDto) {
    const {email, password} = loginDto;

    const user = await this.userModel.findOne({email});

    if (!user) {
      throw new UnauthorizedException('Not valid credentials');
    }

    if (!bcryptjs.compareSync(password, user.password)) {
      throw new UnauthorizedException('Not valid credentials - password is incorrect');
    }

    const { password:_ , ...rest} = user.toJSON();
    return {
      ...rest,
      token: 'ABC-123'
    }
    /**
     * User {id, name, email, roles}
     * Token -> 
     */
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
