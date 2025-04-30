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
import {
  User,
  UserDocument,
  userValidationSchema,
} from './schemas/user.schema/user.schema';
import * as yup from 'yup';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async signup(signupDto: SignupDto) {
    try {
      await userValidationSchema.validate(signupDto, { abortEarly: false });
    } catch (err) {
      throw new BadRequestException(
        err.errors?.join(', ') || 'Validation error',
      );
    }

    const { email, password } = signupDto;

    const existingUser = await this.userModel
      .countDocuments({ email, isDeleted: false })
      .lean();
    if (!!existingUser) throw new BadRequestException('User already exists');

    const user = new this.userModel({ email, password });
    await user.save();

    const token = this.generateToken(user);
    const { password: dbPass, ...restData } = user.toObject();

    return {
      user: { ...restData, token },
    };
  }

  async login(loginDto: LoginDto) {
    const loginValidationSchema = yup.object({
      email: yup.string().email('Invalid email').required('Email is required'),
      password: yup.string().required('Password is required'),
    });

    try {
      await loginValidationSchema.validate(loginDto, { abortEarly: false });
    } catch (err) {
      throw new BadRequestException(
        err.errors?.join(', ') || 'Validation error',
      );
    }

    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid password');

    const token = this.generateToken(user);
    const { password: dbPass, ...restData } = user.toObject();

    return {
      user: { ...restData, token },
    };
  }

  generateToken(user: UserDocument) {
    const payload = { sub: user._id };
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
