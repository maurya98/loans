import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  const users = await User.findAll({ attributes: { exclude: ['password'] } });
  res.json(users);
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  res.json(user);
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, password: hashedPassword, role });
  res.status(201).json({ ...user.toJSON(), password: undefined });
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  const { password, ...rest } = req.body;
  if (password) {
    rest.password = await bcrypt.hash(password, 10);
  }
  await user.update(rest);
  res.json({ ...user.toJSON(), password: undefined });
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  await user.destroy();
  res.status(204).send();
}; 