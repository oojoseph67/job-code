const { MongoClient, ObjectId } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
let db;

client.connect((err) => {
  if (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
  console.log("Connected to MongoDB");
  db = client.db();
});

const resolvers = {
  Query: {
    getTodos: async () => await db.collection("todos").find({}).toArray(),
    getTodo: async (_, { id }) =>
      await db.collection("todos").findOne({ _id: ObjectId(id) }),
  },
  Mutation: {
    createTodo: async (_, { title, description }) => {
      const result = await db
        .collection("todos")
        .insertOne({ title, description, completed: false });
      return { id: result.insertedId, title, description, completed: false };
    },
    updateTodo: async (_, { id, title, description, completed }) => {
      await db
        .collection("todos")
        .updateOne(
          { _id: ObjectId(id) },
          { $set: { title, description, completed } }
        );
      return { id, title, description, completed };
    },
    deleteTodo: async (_, { id }) => {
      const todo = await db.collection("todos").findOne({ _id: ObjectId(id) });
      await db.collection("todos").deleteOne({ _id: ObjectId(id) });
      return todo;
    },
  },
};

module.exports = resolvers;
