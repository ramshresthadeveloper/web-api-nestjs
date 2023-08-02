// import { ConfigService } from '@nestjs/config';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';

// import Lang from '@src/constants/language';
// import { UserRepository } from '@user/repository/user.repository';
// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
//   constructor(
//     private readonly configService: ConfigService,
//     private readonly userRepository: UserRepository,
//   ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: configService.get('JWT_ACCESS_TOKEN_SECRET'),
//     });
//   }

//   async validate(payload: any) {
//     const user = await this.userRepository.findUserById(payload.sub);

//     if (!user) {
//       throw new UnauthorizedException(Lang.UNAUTHORIZED);
//     }

//     if (!user.verifiedAt) {
//       throw new UnauthorizedException(Lang.UNAUTHORIZED);
//     }

//     return user;
//   }
// }
