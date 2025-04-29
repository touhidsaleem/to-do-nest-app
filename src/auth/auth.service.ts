import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import { LoginDto } from './dto/login.dto/login.dto';
import { SignupDto } from './dto/signup.dto/signup.dto';
import { User, UserDocument } from './schemas/user.schema/user.schema';

@Injectable()
export class AuthService {
  private readonly JWT_SECRET =
    '2a45ed6f7f80e4bb087273480e73ce85464c624cde2706116d187408da3ca12aaa16c6aff6aeb6c2764b8f71923f392ed598f541604b94850822a59f';

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
      email,
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    console.log({ isMatch, password, dbPass: user.password });
    if (!isMatch) throw new UnauthorizedException('Invalid password');

    const token = this.generateToken(user);
    return {
      success: true,
      statusCode: 200,
      email,
      token,
    };
  }

  generateToken(user: UserDocument) {
    const payload = { sub: user._id, email: user.email };
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: '1h' });
  }

  verifyToken(token: string) {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
