const request = require('supertest');
const User = require('../models/user');
const Chat = require('../models/chat');
const Message = require('../models/message');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = require('../app');

let userCred;
let userCred2;
let userCred3;
let badCred;

let chat1;
let badChat = new mongoose.Types.ObjectId();
let activeChat;
let deleteChatFail;
let deleteChat1;
let deleteChat2;
let deleteChat3;
let deleteChat4;

let deleteMessage1;
let deleteMessage2;

beforeAll(async () => {
  try {
    // Create users
    await new User(
      {
        username: 'tester1',
        password: 'password'
      }
    ).save();
    userCred = jwt.sign({ username: 'tester1' }, process.env.JWT_SECRET);

    await new User(
      {
        username: 'tester2',
        password: 'password'
      }
    ).save();
    userCred2 = jwt.sign({ username: 'tester2' }, process.env.JWT_SECRET);

    await new User(
      {
        username: 'tester3',
        password: 'password'
      }
    ).save();
    userCred3 = jwt.sign({ username: 'tester3' }, process.env.JWT_SECRET);

    await new User(
      {
        username: 'badtester',
        password: 'password'
      }
    ).save();
    badCred = jwt.sign({ username: 'badtester' }, process.env.JWT_SECRET);

    const spareNames = ['tester4', 'tester5', 'tester6', 'tester7', 'tester8'];
    for (const name of spareNames) {
      await new User(
        {
          username: name,
          password: 'password'
        }
      ).save();
    }

    // Create chats
    const chat = await new Chat(
      {
        users: ['tester1', 'tester2']
      }
    ).save();
    chat1 = chat._id;

    const chat2 = await new Chat(
      {
        users: ['tester1', 'tester3']
      }
    ).save();
    activeChat = chat2._id;

    const deleteFail = await new Chat(
      {
        users: ['tester1', 'tester2']
      }
    ).save();
    deleteChatFail = deleteFail._id;

    const delete1 = await new Chat(
      {
        users: ['tester1', 'tester2']
      }
    ).save();
    deleteChat1 = delete1._id;

    const delete2 = await new Chat(
      {
        users: ['tester1', 'tester2']
      }
    ).save();
    deleteChat2 = delete2._id;

    const delete3 = await new Chat(
      {
        users: ['tester1', 'tester2']
      }
    ).save();
    deleteChat3 = delete3._id;

    const delete4 = await new Chat(
      {
        users: ['tester1', 'tester2']
      }
    ).save();
    deleteChat4 = delete4._id;

    // Create messages
    const message1 = await new Message(
      {
        content: 'Hey',
        author: 'tester1'
      }
    ).save();

    const message2 = await new Message(
      {
        content: 'What\s up?',
        author: 'tester2'
      }
    ).save();

    const message3 = await new Message(
      {
        content: 'Did you know we are testing data?',
        author: 'tester1'
      }
    ).save();

    const message4 = await new Message(
      {
        content: 'No way',
        author: 'tester2'
      }
    ).save();

    for (const message of [message1, message2, message3, message4]) {
      await Chat.findByIdAndUpdate(
        chat1,
        { $push: { messages: message._id } }
      );
    }

    const badMessage1 = await new Message(
      {
        content: 'Bad message 1',
        author: 'tester1'
      }
    ).save();
    deleteMessage1 = badMessage1._id;

    const badMessage2 = await new Message(
      {
        content: 'Bad message 2',
        author: 'tester2'
      }
    ).save();
    deleteMessage2 = badMessage2._id;

    for (const message of [badMessage1, badMessage2]) {
      await Chat.findByIdAndUpdate(
        deleteChat4,
        { $push: { messages: message._id } }
      );
    }
  } catch (err) {
    console.log(err);
  }
});

describe('GET /chat', () => {
  describe('Given valid credentials', () => {
    test('Responds with 200 status code', async () => {
      const response = await request(app)
        .get('/api/chat')
        .set('Authorization', `Bearer ${userCred}`);
      expect(response.statusCode).toBe(200);
    });

    test('Responds with json in content-type header', async () => {
      const response = await request(app)
        .get('/api/chat')
        .set('Authorization', `Bearer ${userCred}`);
      expect(response.headers['content-type'])
        .toEqual(expect.stringContaining('json'));
    });

    test('Responds with chats in json object', async () => {
      const response = await request(app)
        .get('/api/chat')
        .set('Authorization', `Bearer ${userCred}`);
      expect(response.body.chats).toBeDefined();
    });

    // info correct, need to fix the check
    /* test('Chats contain the correct chats', async () => {
      const data = [
        { username: 'tester1', cred: userCred },
        { username: 'tester2', cred: userCred2 },
        { username: 'tester3', cred: userCred3 }
      ]
      for (const input of data) {
        const response = await request(app)
          .get('/api/chat')
          .set('Authorization', `Bearer ${input.cred}`);
        const userChats = await Chat.find({ users: { $in: input.username } });
        console.log(userChats);
        console.log(response.body.chats);
        expect(response.body.chats).toEqual(userChats);
      }
    }); */
  });

  describe('Given no credentials', () => {
    test('Responds with 401 status code', async () => {
      const response = await request(app)
        .get('/api/chat');
      expect(response.statusCode).toBe(401);
    });
  });
});

describe('POST /chat', () => {
  describe('Given valid credentials', () => {
    describe('Given valid username', () => {
      describe('Chat does not already exist', () => {
        test('Responds with 201 status code', async () => {
          const response = await request(app)
            .post('/api/chat')
            .send({ username: 'tester3' })
            .set('Authorization', `Bearer ${userCred2}`);
          expect(response.statusCode).toBe(201);
        });

        test('Responds with json in content-type header', async () => {
          const response = await request(app)
            .post('/api/chat')
            .send({ username: 'tester4' })
            .set('Authorization', `Bearer ${userCred2}`);
          expect(response.headers['content-type'])
            .toEqual(expect.stringContaining('json'));
        });

        test('Responds with chatId in json object', async () => {
          const response = await request(app)
            .post('/api/chat')
            .send({ username: 'tester5' })
            .set('Authorization', `Bearer ${userCred2}`);
          expect(response.body.chatId).toBeDefined();
        });

        test('ChatId is valid', async () => {
          const response = await request(app)
            .post('/api/chat')
            .send({ username: 'tester6' })
            .set('Authorization', `Bearer ${userCred2}`);
          const valid = await Chat.findById(response.body.chatId);
          expect(valid).toBeTruthy();
        });

        test('New chat is created', async () => {
          await request(app)
            .post('/api/chat')
            .send({ username: 'tester7' })
            .set('Authorization', `Bearer ${userCred2}`);
          const valid = await Chat.findOne({ users: ['tester2', 'tester7'] });
          expect(valid).toBeTruthy();
        });

        test('ChatId is correct', async () => {
          const response = await request(app)
            .post('/api/chat')
            .send({ username: 'tester8' })
            .set('Authorization', `Bearer ${userCred2}`);
          const valid = await Chat.findOne({ users: ['tester2', 'tester8'] });
          expect(response.body.chatId).toEqual(valid._id.toString());
        });
      });

      describe('Chat already exists', () => {
        test('Responds with 400 status code', async () => {
          const response = await request(app)
            .post('/api/chat')
            .send({ username: 'tester1' })
            .set('Authorization', `Bearer ${userCred2}`);
          expect(response.statusCode).toBe(400);
        });

        test('Responds with json in content-type header', async () => {
          const response = await request(app)
            .post('/api/chat')
            .send({ username: 'tester1' })
            .set('Authorization', `Bearer ${userCred2}`);
          expect(response.headers['content-type'])
            .toEqual(expect.stringContaining('json'));
        });

        test('Responds with error message in json object', async () => {
          const response = await request(app)
            .post('/api/chat')
            .send({ username: 'tester1' })
            .set('Authorization', `Bearer ${userCred2}`);
          expect(response.body.error).toEqual('Chat already exists');
        });
      });
    });

    describe('Given invalid username', () => {
      test('Responds with 400 status code', async () => {
        const data = [
          null,
          '',
          'hankhillscream',
          'ohwowthisiswaytoolongcanyoubelievethatmorespacetofillhere'
        ];
        for (const name of data) {
          const response = await request(app)
            .post('/api/chat')
            .send({ username: name })
            .set('Authorization', `Bearer ${userCred2}`);
          expect(response.statusCode).toBe(400);
        }
      });

      test('Responds with json in content-type header', async () => {
        const data = [
          null,
          '',
          'hankhillscream',
          'ohwowthisiswaytoolongcanyoubelievethatmorespacetofillhere'
        ];
        for (const name of data) {
          const response = await request(app)
            .post('/api/chat')
            .send({ username: name })
            .set('Authorization', `Bearer ${userCred2}`);
          expect(response.headers['content-type'])
            .toEqual(expect.stringContaining('json'));
        }
      });

      test('Responds with error message in json object', async () => {
        const data = [
          null,
          '',
          'hankhillscream',
          'ohwowthisiswaytoolongcanyoubelievethatmorespacetofillhere'
        ];
        for (const name of data) {
          const response = await request(app)
            .post('/api/chat')
            .send({ username: name })
            .set('Authorization', `Bearer ${userCred2}`);
          expect(response.body.errors).toBeDefined();
        }
      });
    });
  });

  describe('Given no credentials', () => {
    test('Responds with 401 status code', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ username: 'tester1' });
      expect(response.statusCode).toBe(401);
    });
  });
});

describe('GET /chat/:chatid', () => {
  describe('Given valid credentials', () => {
    describe('Given valid chatid', () => {
      test('Responds with 200 status code', async () => {
        const response = await request(app)
          .get(`/api/chat/${chat1}`)
          .set('Authorization', `Bearer ${userCred}`);
        expect(response.statusCode).toBe(200);
      });

      test('Responds with json in content-type header', async () => {
        const response = await request(app)
          .get(`/api/chat/${chat1}`)
          .set('Authorization', `Bearer ${userCred}`);
        expect(response.headers['content-type'])
          .toEqual(expect.stringContaining('json'));
      });

      test('Responds with chat in json object', async () => {
        const response = await request(app)
          .get(`/api/chat/${chat1}`)
          .set('Authorization', `Bearer ${userCred}`);
        expect(response.body.chat).toBeDefined();
      });

      test('Returns correct chat', async () => {
        const response = await request(app)
          .get(`/api/chat/${chat1}`)
          .set('Authorization', `Bearer ${userCred}`);
        const chat = await Chat.findById(chat1).populate('messages');
        expect(response.body.chat.users).toEqual(chat.users);
        const messages = [];
        for (const message of chat.messages) {
          const temp = {
            __v: message.__v,
            _id: message._id.toString(),
            author: message.author,
            content: message.content
          };
          temp.timestamp = message.timestamp.valueOf();
          messages.push(temp);
        }
        for (const message of response.body.chat.messages) {
          message.timestamp = new Date(message.timestamp).valueOf();
        }
        expect(response.body.chat.messages).toEqual(messages);
      });
    });

    describe('Given invalid chatid', () => {
      // Perhaps better to respond with 403
      test('Responds with 404 status code', async () => {
        const response = await request(app)
          .get(`/api/chat/${badChat}`)
          .set('Authorization', `Bearer ${userCred}`);
        expect(response.statusCode).toBe(404);
      });
    });
  });

  describe('Given invalid credentials', () => {
    describe('Given valid chatid', () => {
      test('Responds with 403 status code', async () => {
        const response = await request(app)
          .get(`/api/chat/${chat1}`)
          .set('Authorization', `Bearer ${badCred}`);
        expect(response.statusCode).toBe(403);
      });
    });
  });

  describe('Given no credentials', () => {
    test('Responds with 401 status code', async () => {
      for (const chatid of [chat1, badChat]) {
        const response = await request(app)
          .get(`/api/chat/${chatid}`);
        expect(response.statusCode).toBe(401);
      }
    });
  });
});

describe('POST /chat/:chatid', () => {
  describe('Given valid credentials', () => {
    describe('Given valid chatid', () => {
      describe('Given valid message content', () => {
        test('Responds with 201 status code', async () => {
          const response = await request(app)
            .post(`/api/chat/${activeChat}`)
            .send({ message: "Testing" })
            .set('Authorization', `Bearer ${userCred}`);
          expect(response.statusCode).toBe(201);
        });

        test('Message is added to chat', async () => {
          await request(app)
            .post(`/api/chat/${activeChat}`)
            .send({ message: "Testing one two three" })
            .set('Authorization', `Bearer ${userCred}`);
          const chat = await Chat.findById(activeChat).populate('messages');
          let found = false;
          if (chat.messages[chat.messages.length - 1].content === 'Testing one two three') {
            found = true;
          }
          expect(found).toBeTruthy();
        });
      });

      describe('Given invalid message content', () => {
        test('Responds with 400 status code', async () => {
          const data = [
            null,
            '',
            '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
          ];
          for (const content of data) {
            const response = await request(app)
              .post(`/api/chat/${activeChat}`)
              .send({ message: content })
              .set('Authorization', `Bearer ${userCred}`);
            expect(response.statusCode).toBe(400);
          }
        });

        test('Responds with json in content-type header', async () => {
          const data = [
            null,
            '',
            '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
          ];
          for (const content of data) {
            const response = await request(app)
              .post(`/api/chat/${activeChat}`)
              .send({ message: content })
              .set('Authorization', `Bearer ${userCred}`);
            expect(response.headers['content-type'])
              .toEqual(expect.stringContaining('json'));
          }
        });

        test('Responds with error(s) message in json object', async () => {
          const data = [
            null,
            '',
            '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
          ];
          for (const content of data) {
            const response = await request(app)
              .post(`/api/chat/${activeChat}`)
              .send({ message: content })
              .set('Authorization', `Bearer ${userCred}`);
            expect(response.body.errors).toBeDefined();
          }
        });
      });
    });

    describe('Given invalid chatid', () => {
      test('Responds with 404 status code', async () => {
        const data = [
          'badchat',
          badChat
        ];
        for (const chatid of data) {
          const response = await request(app)
            .post(`/api/chat/${chatid}`)
            .send({ message: 'content' })
            .set('Authorization', `Bearer ${userCred}`);
          expect(response.statusCode).toBe(404);
        }
      });
    });
  });

  describe('Given invalid credentials', () => {
    describe('Given valid chatid', () => {
      test('Responds with 403 status code', async () => {
        const response = await request(app)
          .post(`/api/chat/${activeChat}`)
          .send({ message: 'bad message' })
          .set('Authorization', `Bearer ${badCred}`);
        expect(response.statusCode).toBe(403);
      });

      test('Message is not added to chat', async () => {
        await request(app)
          .post(`/api/chat/${activeChat}`)
          .send({ message: 'bad message' })
          .set('Authorization', `Bearer ${userCred2}`);
        const chat = await Chat.findById(activeChat);
        let found = false;
        if (chat.messages[chat.messages.length - 1].content === 'bad message') {
          found = true;
        }
        expect(found).toBeFalsy();
      });
    });
  });

  describe('Given no credentials', () => {
    test('Responds with 401 status code', async () => {
      for (const chatid of [badChat, activeChat]) {
        const response = await request(app)
          .post(`/api/chat/${chatid}`)
          .send({ message: 'bad message' });
        expect(response.statusCode).toBe(401);
      }
    });

    describe('Given valid chatid', () => {
      test('Message is not added to chat', async () => {
        await request(app)
          .post(`/api/chat/${activeChat}`)
          .send({ message: 'bad message2' });
        const chat = await Chat.findById(activeChat);
        let found = false;
        if (chat.messages[chat.messages.length - 1].content === 'bad message2') {
          found = true;
        }
        expect(found).toBeFalsy();
      });
    });
  });
});

describe('DELETE /chat/:chatid', () => {
  describe('Given valid credentials', () => {
    describe('Given valid chatid', () => {
      test('Responds with 200 status code', async () => {
        const response = await request(app)
          .delete(`/api/chat/${deleteChat1}`)
          .set('Authorization', `Bearer ${userCred}`);
        expect(response.statusCode).toBe(200);
      });

      test('Removes user from chat', async () => {
        await request(app)
          .delete(`/api/chat/${deleteChat2}`)
          .set('Authorization', `Bearer ${userCred}`);
        const chat = await Chat.findById(deleteChat2);
        expect(chat.users.length).toBe(1);
      });

      describe('Both users leave chat', () => {
        test('Chat is deleted', async () => {
          await request(app)
            .delete(`/api/chat/${deleteChat3}`)
            .set('Authorization', `Bearer ${userCred}`);
          await request(app)
            .delete(`/api/chat/${deleteChat3}`)
            .set('Authorization', `Bearer ${userCred2}`);
          const chat = await Chat.findById(deleteChat3);
          expect(chat).toBeFalsy();
        })

        test('All messages are deleted', async () => {
          await request(app)
            .delete(`/api/chat/${deleteChat4}`)
            .set('Authorization', `Bearer ${userCred}`);
          await request(app)
            .delete(`/api/chat/${deleteChat4}`)
            .set('Authorization', `Bearer ${userCred2}`);
          const message1 = await Message.findById(deleteMessage1);
          const message2 = await Message.findById(deleteMessage2);
          expect(message1).toBeFalsy();
          expect(message2).toBeFalsy();
        });
      });
    });

    describe('Given invalid chatid', () => {
      test('Responds with 404 status code', async () => {
        const response = await request(app)
          .delete(`/api/chat/${badChat}`)
          .set('Authorization', `Bearer ${userCred}`);
        expect(response.statusCode).toBe(404);
      });
    });
  });

  describe('Given invalid credentials', () => {
    test('Responds with 403 status code', async () => {
      const response = await request(app)
        .delete(`/api/chat/${deleteChatFail}`)
        .set('Authorization', `Bearer ${badCred}`);
      expect(response.statusCode).toBe(403);
    });
  });

  describe('Given no credentials', () => {
    test('Responds with 401 status code', async () => {
      const response = await request(app)
        .delete(`/api/chat/${deleteChatFail}`);
      expect(response.statusCode).toBe(401);
    });
  });
});

afterAll(async () => {
  await require('../mongoConfigTesting').closeServer();
});
