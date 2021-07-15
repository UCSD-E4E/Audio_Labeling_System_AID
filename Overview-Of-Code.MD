## Github Procedures
Before commiting any changes to the repo
- create a branch of staging
- when the changes are finshed being made to the branch, create a pr request to merge your work branch into staging, not main.
- Never merge to main directly
- request reviewers before merging into staging unless given permission by leads
- Address reviewer concerns then merge into staging once everything is cleared

**Reminder: the only branch that is allowed to be merged into main is the staging branch**
This ensures that the code can be tested before going onto the production branch

When merging from staging to main
- Make a pr request
- have 2 reviewers *fully* test out the website
- reslove any errors by creating a new branch off of staging. 
- Once reviewers approve, okay changes with leads before going ahead

If there is a unrelated bug to your work, create an issue post on the github to be resloved at a later date

**Security Notes**
Don't post passwords, usernames, or url on the repo as this is a security risk
Also don't push the file /audino/.env or rclone config files to the repo. 
If this happens, no worries. Let the leads know so we can change the password.
