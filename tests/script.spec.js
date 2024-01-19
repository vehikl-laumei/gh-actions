const github = {
  rest: {
    pulls: {
      listCommits: jest.fn(),
      update: jest.fn()
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
        ref: 'release/jan-09-tech'
      }
    }
  }
};

const core = {};

const script = require('../.github/script.js');

describe('GitHub Action Script', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('formatCommitMessage', () => {
    test('correctly formats commit messages and updates PR description', async () => {
      // Mock responses for GitHub API
      github.rest.pulls.listCommits.mockResolvedValue({
        data: [
          { commit: { message: '[VSHRED-123] Fix issue (#456)' } },
          { commit: { message: 'Fix issue' } },
        ]
      });

      // Run the script
      await script({
        github,
        context,
        core
      });

      // Assertions
      expect(github.rest.pulls.listCommits)
        .toHaveBeenCalledWith({
          owner: 'testOwner',
          repo: 'testRepo',
          pull_number: 123
        });

      expect(github.rest.pulls.update)
        .toHaveBeenCalledWith({
          owner: 'testOwner',
          repo: 'testRepo',
          pull_number: 123,
          body: '[[VSHRED-123](https://vshred.atlassian.net/browse/VSHRED-123)]: Fix issue ([#456](https://github.com/VinsanityShred/laravel-ecommerce/pull/456))',
          title: expect.anything()
        });
    });
  });

  describe('formatReleaseBranch', () => {
    test('formats release branch name correctly', async () => {
      const branchName = 'release/jan-09-tech';
      const currentYear = new Date().getFullYear(); // To handle dynamic year
      // const formatted = script.formatReleaseBranch(branchName);

      await script({
        github,
        context,
        core
      });

      expect(github.rest.pulls.update)
        .toHaveBeenCalledWith({
          owner: expect.anything(),
          repo: expect.anything(),
          pull_number: expect.anything(),
          body: expect.anything(),
          title: `Tech Release: January 9th, ${currentYear}`
        });
    });
  });
});
