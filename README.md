# GitFix

GitFix is a grammar correction application that uses GPT4 to correct grammar errors in md and mdx files in github repositories with a single click.

> [!NOTE]  
> **This project is a Community Project.**
>
> The project is maintained and supported by the community. Upstash may contribute but does not officially support or assume responsibility for it.

### Tech Stack

- Backend: **Python 3.10** or **Node.js 22**
- AI Integration: **OpenAI API**
- Data Storage: **[Upstash Redis](https://upstash.com/docs/redis/overall/getstarted)**
- Deployment Options: **[Vercel](https://vercel.com)** or **[Fly.io](https://fly.io)**

For python implementation, check out gitfix-python folder under this repository.

## How to Use
 To use GitFix, you can simply run `npm i` and create a config.json file in the root folder. 
Afterwards, you can start your own GitFix server via `npm run dev`.
 Then using `node gitfix_client.js` will fix the grammar errors in the target repository given in the config.json.

### Requirements:

 - NodeJS 22
 - Having a public repository
 - An Upstash Redis database
 - OpenAI API key
 - Github API token with write permissions

### Contents of the config.json file

- github-repo: Target repository which GitFix will search for grammar errors.

- files-per-run: Number of files GitFix will change at each run

- github-token: A classical github token with repo:status, public_repo, and write:packages rights.

- upstash-redis-url: URL to the redis database

- upstash-redis-token: Token or password for the redis database

- redis-password: Set this to true if you are using a password for DB authentication, false otherwise.

- openai-key: OpenAI API key

 You can see an example config file in the config.json in this repository.

### Indexing Your Repository

For GitFix to be able to discover your repository, it should be indexed in GitHub Search Engine. 

You can check if it is indexed by performing a search in your github homepage in following format:

```
repo:[your repo name]  path:*.md
```

If search results in your .md files, your repo is ready to go. Otherwise, you should wait until your repo is indexed. This process should take 2-3 minutes

### Ready to go

After those steps, you can run GitFix.py, and GitFix will look for grammar errors and will correct them automatically.

 Afterwards you will receive the corrected content in a PR request to your repository.

### How It Works

<img src="./static/interaction_diagram.png" width="700">

- GitFix uses GitHub API to fetch md and mdx files and passes these files to GPT4.

- GPT4 indicates the grammar errors and suggests corrections.

- GitFix forks the repository and pushes the corrections. If the target repository is owned by the GitHub key owner, changes are pushed to a separate branch.

- Finally, a PR request is sent to the target repository.

### Deploy It Yourself

You can directly create a Vercel Project for free! For more, see [deploying GitHub repositories with Vercel](https://vercel.com/docs/deployments/git)
In your repository, you should provide the contents of the config.json file as environment variables.
Following provides a matching between config.json content and required environment variables.

```
GITFIX_USE_ENV=true => to instruct gitfix to read environment variables instead of config.json. Existence of config.json file is still required to compile typescript.
"files-per-run"=> FILES_PER_RUN
"github-token"=> GITHUB_TOKEN
"upstash-redis-url"=> process.env.UPSTASH_REDIS_URL
"upstash-redis-token"=> process.env.UPSTASH_REDIS_TOKEN
"openai-key": => OPENAI_KEY
```

### Contributing

GitFix is a work in progress, so we'll add more features and improve the current ones. We've collected a few ideas we believe would make GitFix an even more helpful companion:

---

###### Optimize GPT4 Interaction:

Currently, all of the file context is consumed in one message. We would like to have GPT to consume file content in multiple prompts as time complexity of transformers scale with O(n3). 

In the future, we would like to partition the file content to contextually coherent sections and have gpt perform corrections on one section at a time.

---

###### Enable Unindexed and Private Repositories:

Our current interaction scheme with GitHub API requires the target repo to be a public repository that is indexed in the GitHub Search Engine.

This may cause problems for small repos as the search engine sometimes fails to index them.

If possible, we would like to remove the GitHub search API from our pipeline.


---

If one of these ideas sounds like something you'd like to work on, contributions are very welcome! You can contribute by adding new features, fixing bugs, improving the documentation, writing blog posts, or by sharing GitFix on social media.


