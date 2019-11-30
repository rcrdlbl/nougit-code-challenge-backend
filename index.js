const { ApolloServer, gql } = require('apollo-server');
const entryData = require('./entries.json');

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  type Entry {
    author: Author
    # I'm storing date as a string instead of creating a custom scalar as the client uses the same date formatting that the server does anyway.
    date : String
    # Treating popularity as a float as there's a float value in the data you provided
    popularity: Float
    isTrending: Boolean
    title: String
    description: String
    numComments: Int
    thumbnail: String
    codeSubmissionTotal: Int
    pledgeTotal: Float
    pledgeGoal: Float
    pledgerCount: Int
    # A status of 0 Is Closed, a Status of 1 is open – I'd create a custom type for this if the data source was ever going to be written to, just to validate that it's 0 or 1
    status: Int
  }

  type EntriesResult {
    entries: [Entry]
    totalCount: Int
  }

  type Author {
      name: String
      picture: String
      score: Float
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    getEntries(sortEntriesBy: String, first: Int, offset: Int): EntriesResult
  }
`;

const resolvers = {
  Query: {
    getEntries: (_, __, {first = 5, offset = 0, sortBy = "date"}) => {
      // Sort the data by whichever sortBy method is chosen
      const sortedData = entryData.sort((a, b) => b[sortBy] - a[sortBy])

      // Return a totalCount
      const totalCount = sortedData.length;

      // If first is bypassed, just use the offset
      const entries = first === undefined ?
        sortedData.slice(offset) :
        sortedData.slice(offset, offset + first);

      const result = {
        entries,
        totalCount,
      };
      return result;
    },
  }
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
