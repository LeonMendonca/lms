// import { Module } from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { AuthService } from './students.service';

// @Module({
//   imports: [
//     ConfigModule.forRoot(), 
//     JwtModule.registerAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: async (configService: ConfigService) => ({
//         secret: configService.get<string>('JWT_SECRET'), 
//         signOptions: {} // ✅ No expiration time
//       }),
//     }),
//   ],
//   providers: [AuthService],
//   exports: [AuthService],
// })
// export class AuthModule {}
