import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Driver } from '../drivers/entities/driver.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Driver) // <-- Inject the Driver Repository
    private driverRepository: Repository<Driver>,
    private jwtService: JwtService,
  ) {}

  // --- REGISTRATION LOGIC ---
  async registerUser(fullName: string, email: string, rawPassword: string) {
    // 1. Check if the user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email is already registered.');
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawPassword, salt);

    // 3. Save the new user to the database
    const newUser = this.userRepository.create({
      fullName,
      email,
      passwordHash,
    });

    await this.userRepository.save(newUser);
    return { message: 'User registered successfully!' };
  }

  // --- LOGIN LOGIC ---
  async loginUser(email: string, rawPassword: string) {
    // 1. Find the user by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    // 2. Compare the raw password with the hashed password in the DB
    const isPasswordValid = await bcrypt.compare(
      rawPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    // 3. Generate the JWT (VIP Pass)
    const payload = { sub: user.id, email: user.email, role: 'rider' };
    const accessToken = this.jwtService.sign(payload);

    return {
      sucess: true,
      status: 200,
      message: 'Login successful!',
      data: { accessToken: accessToken },
    };
  }

  // --- DRIVER REGISTRATION LOGIC ---
  async registerDriver(
    fullName: string,
    email: string,
    rawPassword: string,
    vehicleModel: string,
    licensePlate: string,
  ) {
    // 1. Check if the driver already exists
    const existingDriver = await this.driverRepository.findOne({
      where: { email },
    });
    if (existingDriver) {
      throw new ConflictException('Driver email is already registered.');
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawPassword, salt);

    // 3. Save the new driver
    const newDriver = this.driverRepository.create({
      fullName,
      email,
      passwordHash,
      vehicleModel,
      licensePlate,
    });
    await this.driverRepository.save(newDriver);
    return { message: 'Driver registered successfully!' };
  }

  // --- DRIVER LOGIN LOGIC ---
  async loginDriver(email: string, rawPassword: string) {
    // 1. Find the driver by email
    const driver = await this.driverRepository.findOne({ where: { email } });
    if (!driver) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    // 2. Compare the passwords
    const isPasswordValid = await bcrypt.compare(
      rawPassword,
      driver.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    // 3. Generate the VIP Pass, explicitly tagging them as a 'driver'
    const payload = { sub: driver.id, email: driver.email, role: 'driver' };
    const accessToken = this.jwtService.sign(payload);

    return {
      sucess: true,
      status: 200,
      message: 'Driver login successful!',
      data: { access_token: accessToken },
    };
  }
}
