#!/usr/bin/env node 
import childProcess from "child_process";
import {Writable} from "stream"
import path from 'path'
import treeKill from "tree-kill";
import chowkidar from 'chokidar'
type restartEvent = "Manual reload" | "File change";
class Watcher {
    private processExited =true;
    private nodeProcess!:childProcess.ChildProcessByStdio<Writable, null, null>;
    private previousReload: undefined| NodeJS.Timeout;
    private pathsToWatch = [
        path.join(process.cwd(),"/***.js"),
        path.join(process.cwd(),"/**/*.json"),
        path.join(process.cwd(),"/**/*.env.*"),
    ];
    constructor() {
        // console.log(process.argv);
        // console.log(process.cwd())
        if(process.argv.length != 3) {
            console.error(`Expected 1 argument, recieved ${process.argv.length-2} arguments`)
        }else {
            this.init();
        }
    }
    init = async ()=>{
        this.nodeProcess = await this.startProcess();
        this.watchFiles();
        process.once("SIGINT",async ()=> await this.exitHandler("SIGINT"));
        process.once("SIGTERM",async ()=> await this.exitHandler("SIGTERM"));
        process.stdin.on("data",async (chunk)=>{
            const str = chunk.toString();
            if(str === "rs\n") {
                await this.reload("Manual reload"); 
            }
        })
    }
    private startProcess = ()=>{
        const nodeProcess = childProcess.spawn("node",[process.argv[2]],{
            stdio:["pipe",process.stdout,process.stderr]
        })
        this.processExited = false;
        process.stdin.pipe(nodeProcess.stdin);
        nodeProcess.stdin.on("close",()=>{
            process.stdin.unpipe(nodeProcess.stdin);
            process.stdin.resume();
        })
        nodeProcess.on("close",(code,signal)=>{
            this.processExited = true;
            console.log("child process has closed ");
            this.print('log',`Process ${process.argv[2]} exited with ${code ? `code ${code}`:`signal ${signal}`}`);
        });
        nodeProcess.on("error",(err)=>{
            this.processExited = true;
            this.print("log",`Failed to start process ${process.argv[2]}`);
        })
        return nodeProcess;
    }
    private print = (type:keyof Console,message:string)=> {
        console[type](`[WATCHER]: ${message}`)
    }
    private watchFiles =() =>{
        chowkidar
        .watch(this.pathsToWatch,{
            ignored:"**/node_modules/*",
            ignoreInitial:true,
        }).on("all",async ()=>{
                let timeoutKey = setTimeout(async ()=>{
                    if(this.previousReload) clearTimeout(this.previousReload);
                    await this.reload("File change");
                },1000);
                this.previousReload = timeoutKey;
        });
    }
    private reload = async (event:restartEvent) => {
       this.print("info",`${event} detected . Restarting process`);
       await this.stopProcess();
       this.nodeProcess = await this.startProcess();
    }
    private stopProcess = ()=> {
        if(this.processExited) return true;
        return new Promise<boolean>((resolve,reject)=>{
            treeKill(this.nodeProcess.pid,"SIGTERM",(err)=>{
                if(err) treeKill(this.nodeProcess.pid,"SIGKILL",()=>{})
            });
            const key = setInterval(()=>{
                if(this.processExited) {
                    clearInterval(key);
                    resolve(true);
                }
            },500);
        })
    }
    private exitHandler = async (signal:string)=> {
        this.print("debug",`Detected signal ${signal}. Exiting ...`);
        await this.stopProcess();
        process.exit();
    }
}

new Watcher();