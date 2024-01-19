module.exports = async ({ github, context, core }) => {
  // Function to format commit message
  function formatCommitMessage(commitMessage) {
    const teamTicketRegex = /^\[([A-Z]+-\d+)\]/;
    const prNumberRegex = /#(\d+)$/;

    const teamTicketMatch = commitMessage.match(teamTicketRegex);
    const prNumberMatch = commitMessage.match(prNumberRegex);

    if (teamTicketMatch && prNumberMatch) {
      const teamTicket = teamTicketMatch[1];
      const prNumber = prNumberMatch[1];
      return `[[${teamTicket}](https://vshred.atlassian.net/browse/${teamTicket})]: ${commitMessage} ([#${prNumber}](https://github.com/VinsanityShred/laravel-ecommerce/pull/${prNumber}))`;
    }

    return null;
  }

  // Get list of commits in the PR
  const pull_number = context.payload.pull_request.number;
  const owner = context.repo.owner;
  const repo = context.repo.repo;

  const listCommitsResponse = await github.rest.pulls.listCommits({
    owner,
    repo,
    pull_number,
  });

  // Filter and format commits
  const formattedCommits = listCommitsResponse.data
    .map(commit => formatCommitMessage(commit.commit.message))
    .filter(Boolean); // Filter out null values

  // Construct new PR description only if there are formatted commits
  let newDescription = formattedCommits.length > 0 ? formattedCommits.join('\n') : '';

  // Update the PR description if necessary
  if (newDescription) {
    await github.rest.pulls.update({
      owner,
      repo,
      pull_number,
      body: newDescription,
    });
  }
};
