import { Injectable } from "@nestjs/common";
import {User, Bookmark} from '@prisma/client';

@Injectable({})
export class AuthService {
    signin () {
        return {msg: 'I have signin'}
    }

    signup () {
        return {msg: 'I have signup'}
    }

}