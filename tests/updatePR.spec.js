const script = require('../.github/updatePR.js'); // Ensure you are pointing to the correct script file

const github = {
  rest: {
    pulls: {
      listCommits: jest.fn(),
      update: jest.fn(),
      get: jest.fn()
    }
  }
};

const context = {
  repo: {
    owner: 'testOwner',
    repo: 'testRepo'
  },
  payload: {
    pull_request: {
      number: 123,
      head: {
        ref: 'fix/RED-123-fix-issue'
      }
    }
  }
};

const core = {};

describe('GitHub Action Script for PR Updates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Update PR Title & Description', () => {
    test('updates PR title and description for fix branches', async () => {
      context.payload.pull_request.head.ref = 'fix/RED-123-fix-issue';

      github.rest.pulls.get.mockResolvedValue({
        data: {
          owner: 'testOwner',
          repo: 'testRepo',
          pull_number: 123,
          title: 'Original Title',
        }
      });

      await script({ github, context, core });

      expect(github.rest.pulls.update).toHaveBeenCalledWith({
        owner: 'testOwner',
        repo: 'testRepo',
        pull_number: 123,
        title: '[RED-123] Original Title', // Assuming 'Original Title' is the original PR title
        body: '[RED-123](https://vshred.atlassian.net/browse/RED-123)', // Assuming 'Original Body' is the original PR body
      });
    });

    test('updates PR title and description for feature branches', async () => {
      context.payload.pull_request.head.ref = 'feature/GREEN-456-testing';

      github.rest.pulls.get.mockResolvedValue({
        data: {
          owner: 'testOwner',
          repo: 'testRepo',
          pull_number: 123,
          title: 'Original Title'
        }
      });

      await script({ github, context, core });

      expect(github.rest.pulls.update).toHaveBeenCalledWith({
        owner: 'testOwner',
        repo: 'testRepo',
        pull_number: 123,
        title: '[GREEN-456] Original Title',
        body: '[GREEN-456](https://vshred.atlassian.net/browse/GREEN-456)'
      });
    });

  });
});
