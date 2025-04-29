import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import { JWT_SECRET } from 'src/config';
import { LoginDto } from './dto/login.dto/login.dto';
import { SignupDto } from './dto/signup.dto/signup.dto';
import { User, UserDocument } from './schemas/user.schema/user.schema';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async signup(signupDto: SignupDto) {
    const { email, password } = signupDto;
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) throw new BadRequestException('User Already Exist');
    const user = new this.userModel({ email, password });
    await user.save();
    const token = this.generateToken(user);
    return {
      success: true,
      statusCode: 201,
      data: {
        user,
        token,
      },
      error: null,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid password');

    const token = this.generateToken(user);

    return {
      success: true,
      statusCode: 200,
      data: {
        user,
        token,
      },
      error: null,
    };
  }

  generateToken(user: UserDocument) {
    const payload = { sub: user._id, email: user.email };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
  }

  verifyToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
