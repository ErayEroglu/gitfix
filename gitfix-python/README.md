# GitFix

GitFix is a grammar correction application that uses GPT4 to correct grammar errors in md and mdx files in github repositories with a single click.

> [!NOTE]  
> **This project is a Community Project.**
>
> The project is maintained and supported by the community. Upstash may contribute but does not officially support or assume responsibility for it.

### Tech Stack

- Backend: **Python 3.10**
- AI Integration: **OpenAI API**
- Data Storage: **[Upstash Redis](https://upstash.com/docs/redis/overall/getstarted)**
- Deployment Option: **[Fly.io](https://fly.io)**

## How to Use
 To use GitFix, you can simply run `pip install -r requirements.txt` and create a config.yaml file in the same folder as GitFix.py. Then, you are ready to go!

### Requirements:

 - Python > 3.10
 - Having a public repository
 - An Upstash Redis database
 - OpenAI API key

### Contents of the config file

- github-repo: Target repository which GitFix will search for grammar errors.

- files-per-run: Number of files Gitfix will change at each run 

- github-token: A classical github token with repo:status, public_repo, and write:packages rights.

- upstash-redis-url: URL to the redis database

- upstash-redis-token: Token or password for the redis database

- redis-password: Set this to true if you are using a password for DB authentication, false otherwise.

- openai-key: OpenAI API key

 You can see an example config file in the example_config.yaml.

### Indexing Your Repository

For GitFix to be able to discover your repository, it should be indexed in GitHub Search Engine. 

You can check if it is indexed by performing a search in your github homepage in following format:

```
repo:[your repo name]  path:*.md
```

If search results in your .md files, your repo is ready to go. Otherwise, you should wait until your repo is indexed. This process should take 2-3 minutes

### Ready to go

 After those steps, you can run GitFix.py and GitFix will look for grammar errors and will correct them automatically.

 Afterwards you will receive the corrected content in a PR request to your repository.

### How It Works

<img src="./static/interaction_diagram.png" width="700">

- Gitfix uses Github API to fetch md and mdx files and passes these files to GPT4.

- GPT4 indicates the grammar errors and suggests corrections.

- GitFix forks the repository and pushes the corrections. If the target repository is owned by the github key owner, changes are pushed to a seperate branch.

- Finally, a PR request is sent to the target repository.

### Deploy It Yourself

To run the GitFix server, you can simply create a docker image using our Dockerfile. During this process, docker copies the currently existing config file.

Afterwards, you can use that image to deploy to any serverless providers which supports streaming with python applications.

This part is tricky, as there are not many hosting platforms that support streaming with Python, including Lambda (due to bugs in Lambda adapter) and Vercel. To host our app, we preferred **[Fly.io](https://fly.io)** as it provides this rare feature.

To use fly, you should install fly cli, named flyctl. You can check [this](**[Fly.io](https://fly.io)**) tutorial for installation.

To deploy GitFix, you can simply run the following commands:

```bash
fly auth login
fly launch
```

### Contributing

GitFix is a work in progress, so we'll add more features and improve the current ones. We've collected a few ideas we believe would make GitFix an even more helpful companion:

---

###### Optimize GPT4 Interaction:

Currently, all of the file context is consumed in one message. We would like GPT to consume file content in multiple prompts as the time complexity of transformers scales with O(n^3).

In the future, we would like to partition the file content to contextually coherent sections and have gpt perform corrections on one section at a time.

---

###### Enable Unindexed Repositories:

Our current interaction scheme with GitHub API requires the target repo to be indexed in the GitHub Search Engine.

This may cause problems for small repos as the search engine sometimes fails to index them.

If possible, we would like to remove GitHub search API from our pipeline.


---

If one of these ideas sounds like something you'd like to work on, contributions are very welcome! You can contribute by adding new features, fixing bugs, improving the documentation, writing blog posts, or by sharing GitFix on social media.


