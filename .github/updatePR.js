module.exports = async ({ github, context, core }) => {
  const prNumber = context.payload.pull_request.number;
  const branchName = context.payload.pull_request.head.ref;
  const ticketRegex = /(fix|feature|spike)\/([A-Z]+-\d+)/;

  if (ticketRegex.test(branchName)) {
    const ticketId = (branchName.match(ticketRegex))[2];

    const pr = await github.rest.pulls.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: prNumber
    });

    await github.rest.pulls.update({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: prNumber,
      title: `[${ticketId}] ${pr.data.title}`,
      body: `[${ticketId}](https://vshred.atlassian.net/browse/${ticketId})`
    });
  }
};
