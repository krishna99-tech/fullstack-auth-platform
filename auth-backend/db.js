const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');

// Helper to remove null values which crash DynamoDB Global Secondary Indexes
const removeNulls = (obj) => {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== null));
};

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(client);

const USERS_TABLE = process.env.USERS_TABLE || 'auth-users';
const AUTH_SESSIONS_TABLE = process.env.AUTH_SESSIONS_TABLE || 'auth-user-sessions';
const AUDIT_LOGS_TABLE = process.env.AUDIT_LOGS_TABLE || 'auth-audit-logs';
const ANALYTICS_TABLE = process.env.ANALYTICS_TABLE || 'auth-analytics';
const BLOGS_TABLE = process.env.BLOGS_TABLE || 'auth-blogs';
const PROJECTS_TABLE = process.env.PROJECTS_TABLE || 'auth-projects';

async function queryByIndex(tableName, indexName, keyName, keyValue) {
  const params = {
    TableName: tableName,
    IndexName: indexName,
    KeyConditionExpression: '#k = :v',
    ExpressionAttributeNames: { '#k': keyName },
    ExpressionAttributeValues: { ':v': keyValue }
  };
  const result = await docClient.send(new QueryCommand(params));
  return result.Items || [];
}

const db = {
  user: {
    findUnique: async ({ where }) => {
      if (where.id) {
        const result = await docClient.send(new GetCommand({ TableName: USERS_TABLE, Key: { id: where.id } }));
        return result.Item || null;
      }
      if (where.email) {
        const items = await queryByIndex(USERS_TABLE, 'EmailIndex', 'email', where.email);
        return items.length > 0 ? items[0] : null;
      }
      if (where.username) {
        const items = await queryByIndex(USERS_TABLE, 'UsernameIndex', 'username', where.username);
        return items.length > 0 ? items[0] : null;
      }
      if (where.googleId) {
        const items = await queryByIndex(USERS_TABLE, 'GoogleIdIndex', 'googleId', where.googleId);
        return items.length > 0 ? items[0] : null;
      }
      if (where.githubId) {
        const items = await queryByIndex(USERS_TABLE, 'GithubIdIndex', 'githubId', where.githubId);
        return items.length > 0 ? items[0] : null;
      }
      return null;
    },
    create: async ({ data }) => {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const item = { 
        id, 
        createdAt: now,
        isVerified: false,
        mfaEnabled: false,
        emailNotifications: false,
        accentColor: "59, 130, 246",
        accentColor: "59, 130, 246",
        ...data 
      };
      const cleanItem = removeNulls(item);
      await docClient.send(new PutCommand({ TableName: USERS_TABLE, Item: cleanItem }));
      return cleanItem;
    },
    update: async ({ where, data }) => {
      const user = await db.user.findUnique({ where });
      if (!user) throw new Error("User not found");
      const updatedItem = { ...user, ...data };
      const cleanItem = removeNulls(updatedItem);
      await docClient.send(new PutCommand({ TableName: USERS_TABLE, Item: cleanItem }));
      return cleanItem;
    },
    delete: async ({ where }) => {
      const user = await db.user.findUnique({ where });
      if (user) {
        await docClient.send(new DeleteCommand({ TableName: USERS_TABLE, Key: { id: user.id } }));
      }
    }
  },
  session: {
    findUnique: async ({ where }) => {
      if (where.id) {
        const result = await docClient.send(new GetCommand({ TableName: AUTH_SESSIONS_TABLE, Key: { id: where.id } }));
        return result.Item || null;
      }
      if (where.token) {
        const items = await queryByIndex(AUTH_SESSIONS_TABLE, 'TokenIndex', 'token', where.token);
        return items.length > 0 ? items[0] : null;
      }
      return null;
    },
    findMany: async ({ where }) => {
      if (where.userId) {
        return await queryByIndex(AUTH_SESSIONS_TABLE, 'UserIdIndex', 'userId', where.userId);
      }
      return [];
    },
    create: async ({ data }) => {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const item = { id, lastActive: now, createdAt: now, ...data };
      await docClient.send(new PutCommand({ TableName: AUTH_SESSIONS_TABLE, Item: item }));
      return item;
    },
    update: async ({ where, data }) => {
      const session = await db.session.findUnique({ where });
      if (!session) throw new Error("Session not found");
      const updatedItem = { ...session, ...data };
      await docClient.send(new PutCommand({ TableName: AUTH_SESSIONS_TABLE, Item: updatedItem }));
      return updatedItem;
    },
    delete: async ({ where }) => {
      if (where.id) {
        await docClient.send(new DeleteCommand({ TableName: AUTH_SESSIONS_TABLE, Key: { id: where.id } }));
      }
    },
    deleteMany: async ({ where }) => {
      if (where.userId) {
        const sessions = await queryByIndex(AUTH_SESSIONS_TABLE, 'UserIdIndex', 'userId', where.userId);
        for (const s of sessions) {
          if (where.id && where.id.not) {
             if (s.id !== where.id.not) {
                await docClient.send(new DeleteCommand({ TableName: AUTH_SESSIONS_TABLE, Key: { id: s.id } }));
             }
          } else {
             await docClient.send(new DeleteCommand({ TableName: AUTH_SESSIONS_TABLE, Key: { id: s.id } }));
          }
        }
      }
    }
  },
  auditLog: {
    create: async ({ data }) => {
      const timestamp = new Date().toISOString();
      const item = { 
        timestamp,
        ...data 
      };
      await docClient.send(new PutCommand({ TableName: AUDIT_LOGS_TABLE, Item: item }));
      return item;
    },
    findMany: async ({ where, skip, take }) => {
      if (where.userId) {
        // Query logs for a user, sorted by timestamp descending
        const params = {
          TableName: AUDIT_LOGS_TABLE,
          KeyConditionExpression: '#u = :u',
          ExpressionAttributeNames: { '#u': 'userId' },
          ExpressionAttributeValues: { ':u': where.userId },
          ScanIndexForward: false, // newest first
        };
        const result = await docClient.send(new QueryCommand(params));
        let items = result.Items || [];
        
        // In-memory pagination for simple mock ORM
        if (skip !== undefined || take !== undefined) {
          const s = skip || 0;
          const t = take || items.length;
          items = items.slice(s, s + t);
        }
        return items;
      }
      return [];
    },
    count: async ({ where }) => {
      if (where.userId) {
        const params = {
          TableName: AUDIT_LOGS_TABLE,
          KeyConditionExpression: '#u = :u',
          ExpressionAttributeNames: { '#u': 'userId' },
          ExpressionAttributeValues: { ':u': where.userId },
          Select: 'COUNT'
        };
        const result = await docClient.send(new QueryCommand(params));
        return result.Count || 0;
      }
      return 0;
    }
  },
  analytics: {
    create: async ({ data }) => {
      const timestamp = new Date().toISOString();
      const item = { 
        timestamp,
        ...data 
      };
      await docClient.send(new PutCommand({ TableName: ANALYTICS_TABLE, Item: item }));
      return item;
    },
    findMany: async ({ where }) => {
      if (where.userId) {
        const params = {
          TableName: ANALYTICS_TABLE,
          KeyConditionExpression: '#u = :u',
          ExpressionAttributeNames: { '#u': 'userId' },
          ExpressionAttributeValues: { ':u': where.userId },
          ScanIndexForward: false, // newest first
        };
        const result = await docClient.send(new QueryCommand(params));
        let items = result.Items || [];
        
        if (where.eventType) {
          items = items.filter(item => item.eventType === where.eventType);
        }
        
        return items;
      }
      return [];
    }
  },
  blog: {
    findUnique: async ({ where }) => {
      if (where.id) {
        const result = await docClient.send(new GetCommand({ TableName: BLOGS_TABLE, Key: { id: where.id } }));
        return result.Item || null;
      }
      if (where.slug) {
        const items = await queryByIndex(BLOGS_TABLE, 'SlugIndex', 'slug', where.slug);
        return items.length > 0 ? items[0] : null;
      }
      return null;
    },
    findMany: async ({ where, orderBy }) => {
      let items = [];
      if (where?.authorId) {
        items = await queryByIndex(BLOGS_TABLE, 'AuthorIdIndex', 'authorId', where.authorId);
        if (where.status) items = items.filter((item) => item.status === where.status);
      } else if (where?.status === 'published') {
        const result = await docClient.send(new ScanCommand({
          TableName: BLOGS_TABLE,
          FilterExpression: '#s = :published',
          ExpressionAttributeNames: { '#s': 'status' },
          ExpressionAttributeValues: { ':published': 'published' },
        }));
        items = result.Items || [];
      }
      if (orderBy?.createdAt === 'desc') {
        items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      }
      return items;
    },
    create: async ({ data }) => {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const item = { id, createdAt: now, updatedAt: now, status: 'draft', ...data };
      const cleanItem = removeNulls(item);
      await docClient.send(new PutCommand({ TableName: BLOGS_TABLE, Item: cleanItem }));
      return cleanItem;
    },
    update: async ({ where, data }) => {
      const post = await db.blog.findUnique({ where });
      if (!post) throw new Error('Blog post not found');
      const updatedItem = removeNulls({ ...post, ...data, updatedAt: new Date().toISOString() });
      await docClient.send(new PutCommand({ TableName: BLOGS_TABLE, Item: updatedItem }));
      return updatedItem;
    },
    delete: async ({ where }) => {
      const post = await db.blog.findUnique({ where });
      if (post) {
        await docClient.send(new DeleteCommand({ TableName: BLOGS_TABLE, Key: { id: post.id } }));
      }
    },
  },
  project: {
    findUnique: async ({ where }) => {
      if (where.id) {
        const result = await docClient.send(new GetCommand({ TableName: PROJECTS_TABLE, Key: { id: where.id } }));
        return result.Item || null;
      }
      if (where.slug) {
        const items = await queryByIndex(PROJECTS_TABLE, 'SlugIndex', 'slug', where.slug);
        return items.length > 0 ? items[0] : null;
      }
      return null;
    },
    findMany: async ({ where, orderBy }) => {
      let items = [];
      if (where?.authorId) {
        items = await queryByIndex(PROJECTS_TABLE, 'AuthorIdIndex', 'authorId', where.authorId);
        if (where.status) items = items.filter((item) => item.status === where.status);
      } else if (where?.status === 'published') {
        const result = await docClient.send(new ScanCommand({
          TableName: PROJECTS_TABLE,
          FilterExpression: '#s = :published',
          ExpressionAttributeNames: { '#s': 'status' },
          ExpressionAttributeValues: { ':published': 'published' },
        }));
        items = result.Items || [];
      }
      if (orderBy?.createdAt === 'desc') {
        items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      }
      return items;
    },
    create: async ({ data }) => {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const item = { id, createdAt: now, updatedAt: now, status: 'draft', ...data };
      const cleanItem = removeNulls(item);
      await docClient.send(new PutCommand({ TableName: PROJECTS_TABLE, Item: cleanItem }));
      return cleanItem;
    },
    update: async ({ where, data }) => {
      const project = await db.project.findUnique({ where });
      if (!project) throw new Error('Project not found');
      const updatedItem = removeNulls({ ...project, ...data, updatedAt: new Date().toISOString() });
      await docClient.send(new PutCommand({ TableName: PROJECTS_TABLE, Item: updatedItem }));
      return updatedItem;
    },
    delete: async ({ where }) => {
      const project = await db.project.findUnique({ where });
      if (project) {
        await docClient.send(new DeleteCommand({ TableName: PROJECTS_TABLE, Key: { id: project.id } }));
      }
    },
  },
};

db.docClient = docClient;
module.exports = db;
