import { comparePasswords, hashPassword, validatePassword } from "../utils/password.utils";
import { generateToken } from "../utils/jwt.utils";
import { UserType, UserRegisterType, JwtPayload, UserLoginType } from "../types/types";
import { User } from "../models";

export const register = async (user: UserRegisterType) => {

    const existingUser = await User.findOne({ where: { email: user.email } });
    // console.log("ASDASD")
    if (existingUser) {
        throw new Error('User with this email already exists');
    }

    if (!validatePassword(user.password)) {
        // console.log('USDFOASDF');
        throw new Error('Password must contain at least 8 characters, 1 uppercase, 1 lowercase, and 1 number');
    }

    // console.log("JKLJKL")
    const hashedPassword = await hashPassword(user.password);

    const newUser = await User.create({ email: user.email, password: hashedPassword });

    // console.log("test")
    const { password, ...userWithoutPassword } = newUser.get() as UserType;

    const payload: JwtPayload = {
        id: userWithoutPassword.user_id,
        email: userWithoutPassword.email,
    }

    return {
        user: payload,
        token: generateToken(payload)
    };
}

export const login = async (user: UserLoginType) => {
    const existingUser = await User.findOne({ where: { email: user.email } });
    if (!existingUser) {
        throw new Error('User with this email does not exist');
    }

    const userData = existingUser.get() as UserType;

    const checkPassword = await comparePasswords(user.password, userData.password)

    if(!checkPassword) {
        throw new Error('Invalid password');
    }

    const payload: JwtPayload = {
        id: userData.user_id,
        email: userData.email,
    }

    return {
        user: payload,
        token: generateToken(payload)
    }
}

