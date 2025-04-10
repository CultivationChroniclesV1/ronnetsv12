# Netlify Deployment Troubleshooting

## Common Deployment Errors

### "Could not resolve serverless-http" Error

If you see this error in your Netlify deployment logs:
```
✘ [ERROR] Could not resolve "serverless-http"
     netlify/functions/api.mjs:3:23:
       3 │ import serverless from "serverless-http";
         ╵                        ~~~~~~~~~~~~~~~~~
```

**Solution:**
1. Install the missing dependency:
   ```
   npm install serverless-http --save
   ```

2. Commit the changes to your Git repository:
   ```
   git add package.json package-lock.json
   git commit -m "Add serverless-http dependency"
   git push
   ```

3. Redeploy on Netlify or let your Git integration trigger a new build

### DATABASE_URL Not Found Error

If you see this message in your Netlify build logs:
```
⚠️ IMPORTANT: Missing environment variables:
  - DATABASE_URL: Required for the application to function properly
```

**Solution:**
1. Go to your Netlify site dashboard
2. Navigate to Site settings > Build & deploy > Environment
3. Add a new environment variable:
   - Key: `DATABASE_URL`
   - Value: Your PostgreSQL connection string (e.g., `postgres://username:password@hostname:port/database`)
4. Click "Save"
5. Trigger a new deployment

## General Netlify Deployment Tips

1. **Check build logs carefully**: Netlify provides detailed build logs that can help you identify what's going wrong.

2. **Test builds locally**: You can use the Netlify CLI to test your build process locally before deploying.
   ```
   npm install -g netlify-cli
   netlify build
   ```

3. **Use the Netlify dev environment**: The Netlify CLI can create a local development environment that closely matches production.
   ```
   netlify dev
   ```

4. **Check your netlify.toml file**: Make sure your configuration is correct, especially the build command and publish directory.

5. **Monitor function logs**: After deployment, check the Functions tab in your Netlify dashboard to see logs from your serverless functions.

6. **Verify your database connection**: Make sure your database is accessible from Netlify's servers and your connection string is correct.

## Getting Additional Help

If you continue to experience issues, you can:

1. Check the [Netlify documentation](https://docs.netlify.com/)
2. Search the [Netlify Community forum](https://answers.netlify.com/)
3. Contact Netlify support through your dashboard