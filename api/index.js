
import express from "express";
import serverless from "serverless-http";
import fs from "fs";
import path from "path";

const app = express();

app.get("/api/health", (req,res)=>{
  res.json({ status: "ok" });
});

// Auto-load all routers
const routerPath = path.join(process.cwd(), "router");

function loadRouters(dir){
  const files = fs.readdirSync(dir);

  for(const file of files){
    const full = path.join(dir,file);
    const stat = fs.statSync(full);

    if(stat.isDirectory()){
      loadRouters(full);
    } else if(file.endsWith(".js") || file.endsWith(".ts")){
      import(full).then(mod=>{
        if(mod.default){
          app.use("/api", mod.default);
        }
      }).catch(()=>{});
    }
  }
}

loadRouters(routerPath);

export const handler = serverless(app);
export default handler;
