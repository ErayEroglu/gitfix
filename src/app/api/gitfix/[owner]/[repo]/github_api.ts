class GithubAPIWrapper {
  owner: string;
  repo: string;
  auth: string;
  items: any[];
  details: any;
  updatedItems: number[];
  constructor(owner: string, repo: string, auth: string) {
    this.owner = owner;
    this.repo = repo;
    this.auth = auth;
    this.items = [];
    this.populateDetails();
    this.updatedItems = [];
  }

  async getItems( demoMode: boolean = false): Promise<void> {
    let initialPageSize = 100;
    if (demoMode) {
      //TODO: roll this back to 30
      initialPageSize = 100;
    }
    let pageSize = initialPageSize;
    let page = 1;

    while (pageSize === initialPageSize) {
      const url = `https://api.github.com/search/code?q=extension:mdx+extension:md+repo:${this.owner}/${this.repo}&per_page=${initialPageSize}&page=${page}`;
      const headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${this.auth}`,
      };

      const response = await fetch(url, { headers });
      const data = await response.json();
      pageSize = data.items.length;
      console.log(`discovering itemms in ${this.owner + "/" + this.repo}`)
      for (const item of data.items) {
        console.log(`\t${item.path}`);
        this.items.push({ path: item.path, sha: item.sha });
      }

      page += 1;

      if (demoMode) {
        break;
      }
    }
  }

  async getItemContent(index: number): Promise<string> {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.items[index].path}`;
    const headers = {
      "Accept": "application/vnd.github.raw+json",
      "Authorization": `Bearer ${this.auth}`,
    };

    const response = await fetch(url, { headers });
    return response.text();
  }

  async populateDetails(): Promise<void> {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}`;
    const headers = {
      "Accept": "application/vnd.github.raw+json",
      "Authorization": `Bearer ${this.auth}`,
    };

    const response = await fetch(url, { headers });
    this.details = await response.json();
  }

  async fork(): Promise<GithubAPIWrapper> {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/forks`;
    const headers = {
      "Accept": "application/vnd.github.raw+json",
      "Authorization": `Bearer ${this.auth}`,
      "X-GitHub-Api-Version": "2022-11-28"
    };
    const body = {
      "name": `GitFix-${this.owner}-${this.repo}`,
      "default_branch_only": "True"
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });

    const content = await response.json();
    const full_name = content["full_name"];
    const [owner, repo] = full_name.split('/');

    const forkedRepo = new GithubAPIWrapper(owner, repo, this.auth);
    forkedRepo.items = this.items;
    return forkedRepo;
  }
  async updateFileContent(index: number, content: string): Promise<Response> {
    const path = this.items[index].path;
    const sha = this.items[index].sha;
    console.log(`sending update request for ${path}`);
    const contentBytes = new TextEncoder().encode(content);
    const base64String = Buffer.from(contentBytes).toString('base64');
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        "Accept": "application/vnd.github.raw+json",
        "Authorization": `Bearer ${this.auth}`,
        "X-GitHub-Api-Version": "2022-11-28"
      },
      body: JSON.stringify({
        message: `GitFix: correcting grammar errors on ${path}`,
        content: base64String,
        sha: sha,
        branch: "gitfix"
      })
    });
    if(response.status == 201){
      this.updatedItems.push(index)
    }
    return response;

  }

  async createAReference(originalRef: string, newRefName: string): Promise<Response> {
    const originalRefData = await this.getRef(originalRef);
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/git/refs`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        "Accept": "application/vnd.github.raw+json",
        "Authorization": `Bearer ${this.auth}`,
        "X-GitHub-Api-Version": "2022-11-28"
      },
      body: JSON.stringify({
        ref: `refs/heads/${newRefName}`,
        sha: originalRefData.object.sha
      })
    });
    // console.log(response.json())
    return response;
  }

  async createARefFromDefaultBranch(newRefName: string): Promise<Response> {
    const originalRef = await this.getDefaultBranch();
    return await this.createAReference(originalRef, newRefName);
  }

  async getRef(ref: string, trials = 0): Promise<any> {
    console.log(`creating reference trial ${trials}`)
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/git/ref/heads/${ref}`;
    const headers = {
      'Accept': "application/vnd.github.raw+json",
      'Authorization': `Bearer ${this.auth}`,
      'cache-control': "no-cache"
    };

    const response:Response = await fetch(url, { headers:headers, cache:'reload' });
    // console.log('response.json:')
    // console.log(response.json());
    if (response.status != 200) {
      if (trials > 50) {
        throw new Error("Could not create reference");
      }
      
      await new Promise(resolve => setTimeout(resolve, 10000)); // Sleep for 10 seconds
      return await this.getRef(ref, trials + 1);
    }
    return response.json();
    
  }

  getDefaultBranch(): string {
    return this.details["default_branch"];
  }

  async createPR(alteredRepo: GithubAPIWrapper) {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/pulls`;
    const headers = {
      "Accept": "application/vnd.github.raw+json",
      "Authorization": `Bearer ${this.auth}`,
      "X-GitHub-Api-Version": "2022-11-28"
    };
    let bodyContent = "Correcting grammar errors in following files:\n"
    for(let index in this.updatedItems){
      bodyContent += `\t${this.items[index].path}\n`;
    }
    bodyContent += "Automated by GitFix";
    const body = {
      "title": "Gitfix: fixing grammar errors in md and mdx files.",
      "head": "gitfix",
      "head_repo": `${alteredRepo.owner}/${alteredRepo.repo}`,
      "base": this.getDefaultBranch(),
      "maintainer_can_modify": true,
      "body": bodyContent
    };
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    return response;
  }

}

export const fetchCache = 'force-no-store';
export default GithubAPIWrapper;