const { default: mongoose } = require('mongoose');
const { HTTP_STATUS_OK, HTTP_STATUS_CREATED } = require('http2').constants;
const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(HTTP_STATUS_OK).send(users))
    .catch(next);
};

module.exports.getUserbyId = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail()
    .then((user) => {
      res.status(HTTP_STATUS_OK).send(user);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        next(new BadRequestError(`Некорректные _id: ${req.params.userId}`));
      } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
        next(new NotFoundError(`Пользователь с таким _id: ${req.params.userId} не найден`));
      } else {
        next(err);
      }
    });
};

module.exports.createUser = (req, res, next) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.status(HTTP_STATUS_CREATED).send(user))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError(err.message));
      } else {
        next(err);
      }
    });
};

module.exports.editProfile = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: 'true', runValidators: true })
    .orFail()
    .then((user) => res.status(HTTP_STATUS_OK).send(user))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError(err.message));
      } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
        next(new NotFoundError('Пользователь по указанному _id не найден'));
      } else {
        next(err);
      }
    });
};

module.exports.editAvatar = (req, res, next) => {
  User.findByIdAndUpdate(req.user._id, { avatar: req.body.avatar }, { new: 'true', runValidators: true })
    .orFail()
    .then((user) => res.status(HTTP_STATUS_OK).send(user))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError(err.message));
      } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
        next(new NotFoundError('Пользователь по указанному _id не найден'));
      } else {
        next(err);
      }
    });
};
