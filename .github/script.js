const { parse, format, getYear } = require('date-fns');

function formatCommitMessage(commitMessage) {
  const commitMessageRegex = /\[[A-Za-z]+-\d+] .+ \(#\d+\)/;

  if (!commitMessageRegex.test(commitMessage)) {
    return null;
  }

  const teamTicketRegex = /([A-Z]+-\d+)/;
  const prNumberRegex = /#(\d+)/;
  const messageRegex = /](.*?)\(/;

  const teamTicketMatch = commitMessage.match(teamTicketRegex);
  const prNumberMatch = commitMessage.match(prNumberRegex);

  const teamTicket = teamTicketMatch ? teamTicketMatch[1] : false;
  const prNumber = prNumberMatch ? prNumberMatch[1] : false;

  if (!teamTicket || !prNumber) {
    return null;
  }

  const trimmedCommitMessage = (commitMessage.match(messageRegex) ? commitMessage.match(messageRegex)[1] : 'null_message').trim(); // todo not this

  const uppercaseTeamTicket = teamTicket.toUpperCase();

  return `[[${uppercaseTeamTicket}](https://vshred.atlassian.net/browse/${uppercaseTeamTicket})]: ${trimmedCommitMessage} ([#${prNumber}](https://github.com/VinsanityShred/laravel-ecommerce/pull/${prNumber}))`;
}

function formatReleaseBranch(branchName) {
  const [partialDate] = branchName.match(/([a-z]{3}-\d{2})/)
  const parts = branchName.split('-');

  const title = parts[2].charAt(0).toUpperCase() + parts[2].slice(1);
  const parsedDate = parse(partialDate, 'MMM-dd', new Date());
  const formattedDate = format(parsedDate, 'MMMM do');

  return `${title} Release: ${formattedDate}, ${getYear(new Date())}`
}

module.exports = async ({
  github,
  context,
  core
}) => {
  const pull_number = context.payload.pull_request.number;
  const owner = context.repo.owner;
  const repo = context.repo.repo;

  const listCommitsResponse = await github.rest.pulls.listCommits({
    owner,
    repo,
    pull_number,
  });

  const formattedCommits = listCommitsResponse.data
    .map(commit => formatCommitMessage(commit.commit.message))
    .filter(Boolean);

  let newDescription = formattedCommits.length > 0 ? formattedCommits.join('\n') : '';

  if (newDescription) {
    await github.rest.pulls.update({
      owner,
      repo,
      pull_number,
      title: formatReleaseBranch(context.payload.pull_request.head.ref),
      body: newDescription,
    });
  }
};
