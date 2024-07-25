import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { ValidateRquest, BadRequestError } from '@komtickets/common';
import { User } from '../models/user';
import { PasswordManager } from '../services/password';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('You must supply a password'),
  ],
  ValidateRquest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const passMatch = await PasswordManager.compare(
      existingUser.password,
      password
    );

    if (!passMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    // generate jwt token
    const userJwt = jwt.sign(
      { id: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY!
    );

    // add the token to a cookie session
    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(existingUser);
  }
);

export { router as signInRouter };
