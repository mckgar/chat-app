const request = require('supertest');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = require('../app');

describe('POST /user', () => {
  describe('Given valid username', () => {
    describe('Given valid password', () => {
      test('Responds with 201 status code', async () => {
        const response = await request(app)
          .post('/api/user')
          .send({ username: 'tester1', password: 'password' });
        expect(response.statusCode).toBe(201);
      });

      test('Responds with json in content-type header', async () => {
        const response = await request(app)
          .post('/api/user')
          .send({ username: 'tester2', password: 'password' });
        expect(response.headers['content-type'])
          .toEqual(expect.stringContaining('json'));
      });

      test('Responds with json object containing JWT', async () => {
        const response = await request(app)
          .post('/api/user')
          .send({ username: 'tester3', password: 'password' });
        expect(response.body.token).toBeDefined();
      });

      test('JWT is valid', async () => {
        const response = await request(app)
          .post('/api/user')
          .send({ username: 'tester4', password: 'password' });
        const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
        expect(decoded.username === 'tester4').toBeTruthy();
      });

      test('Saves new user to the database', async () => {
        await request(app)
          .post('/api/user')
          .send({ username: 'tester5', password: 'password' });
        const newUser = await User.findOne({ username: 'tester5' });
        expect(newUser).toBeTruthy();
      });

      test('Hashes password before saving to the database', async () => {
        await request(app)
          .post('/api/user')
          .send({ username: 'tester6', password: 'password' });
        const newUser = await User.findOne({ username: 'tester6' });
        const valid = await bcrypt.compare('password', newUser.password);
        expect(valid && newUser.passowrd !== 'password').toBeTruthy();
      });
    });

    describe('Given invalid password', () => {
      test('Responds with 400 status code', async () => {
        const data = [
          { username: 'tester7' },
          { username: 'tester7', password: null },
          { username: 'tester7', passowrd: 'short' }
        ];
        for (const body of data) {
          const response = await request(app)
            .post('/api/user')
            .send(body);
          expect(response.statusCode).toBe(400);
        }
      });

      test('Responds with json in content-type header', async () => {
        const data = [
          { username: 'tester7' },
          { username: 'tester7', password: null },
          { username: 'tester7', passowrd: 'short' }
        ];
        for (const body of data) {
          const response = await request(app)
            .post('/api/user')
            .send(body);
          expect(response.headers['content-type'])
            .toEqual(expect.stringContaining('json'));
        }
      });

      test('Responds with error message', async () => {
        const data = [
          { username: 'tester7' },
          { username: 'tester7', password: null },
          { username: 'tester7', passowrd: 'short' }
        ];
        for (const body of data) {
          const response = await request(app)
            .post('/api/user')
            .send(body);
          expect(response.body['errors']).toBeTruthy();
        }
      });
    });
  });

  describe('Given invalid username', () => {
    test('Responds with 400 status code', async () => {
      await request(app)
        .post('/api/user')
        .send({ username: 'badtester1', password: 'password' });
      const response = await request(app)
        .post('/api/user')
        .send({ username: 'badtester1', password: 'password' });
      expect(response.statusCode).toBe(400);
    });

    test('Responds with json in content-type header', async () => {
      await request(app)
        .post('/api/user')
        .send({ username: 'badtester2', password: 'password' });
      const response = await request(app)
        .post('/api/user')
        .send({ username: 'badtester2', password: 'password' });
      expect(response.headers['content-type'])
        .toEqual(expect.stringContaining('json'));
    });

    test('Responds with error message', async () => {
      await request(app)
        .post('/api/user')
        .send({ username: 'badtester3', password: 'password' });
      const response = await request(app)
        .post('/api/user')
        .send({ username: 'badtester3', password: 'password' });
      expect(response.body['errors']).toBeTruthy();
    });
  });
});

afterAll(async () => {
  await require('../mongoConfigTesting').closeServer();
});
