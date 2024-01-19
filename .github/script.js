module.exports = async ({
  github,
  context,
  core
}) => {
  // Get the PR description
  console.log('Getting PR description');

  // Function to format commit message
  function formatCommitMessage(commitMessage) {
    const teamTicketRegex = /^\[([A-Z]+-\d+)\]/;
    const prNumberRegex = /#(\d+)$/;

    const teamTicketMatch = commitMessage.match(teamTicketRegex);
    const prNumberMatch = commitMessage.match(prNumberRegex);

    const teamTicket = teamTicketMatch ? teamTicketMatch[1] : false;
    const prNumber = prNumberMatch ? prNumberMatch[1] : false;

    if (!prNumber) {
      return null;
    }

    return `[[${teamTicket}](https://vshred.atlassian.net/browse/${teamTicket})]: ${commitMessage} ([#${prNumber}](https://github.com/VinsanityShred/laravel-ecommerce/pull/${prNumber}))`;
  }

  // Get list of commits in the PR
  const pull_number = context.payload.pull_request.number;
  const owner = context.repo.owner;
  const repo = context.repo.repo;

  console.log(`Getting commits for PR #${pull_number}`);
  console.log(`Owner: ${owner}`);
  console.log(`Repo: ${repo}`);

  const listCommitsResponse = await github.rest.pulls.listCommits({
    owner,
    repo,
    pull_number,
  });

  console.log(`Found ${listCommitsResponse.data.length} commits`);

  // Filter and format commits
  const formattedCommits = listCommitsResponse.data
    .map(commit => formatCommitMessage(commit.commit.message))
    .filter(Boolean); // Filter out null values

  console.log(`Found ${formattedCommits.length} formatted commits`);
  console.log(formattedCommits);

  // Construct new PR description only if there are formatted commits
  let newDescription = formattedCommits.length > 0 ? formattedCommits.join('\n') : '';
  console.log(`New PR description: ${newDescription}`);

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
