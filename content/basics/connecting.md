---
title: "Accessing the cluster"
date: 2023-02-26T15:19:13+01:00
draft: false
weight: 1
---

## Getting an account
You must first have an account before you can access the cluster. Please contact the administrators for detailed information on how to get your account. If you are eligible, you will receive the specific details to access the cluster, including your username and password.

## Connecting to the cluster

Once you have your account ready, you will need a secure shell program to log in to the cluster. Keep in mind that ssh based connections are needed both for console (command-line) and for file transfer sessions.

If you are on a Mac or linux machine, you already have a command line ssh client available on your system. Recent versions of Windows can also use the Windows Linux Subsystem to get a command-line ssh client. Alternatively, there are free and open-source graphical ssh clients available (for instance, PuTTY for Windows).

Please note that regardless your ssh client, once you connect to the cluster you'll be in a linux command-line environment, from which you'll submit your computing jobs. This means you need a minimum working knowledge of the linux command-line shell environment (which is bash by default).

As for file transfer, as noted above, an ssh-based connection is needed, and you can perform file transfers from your workstation to the cluster using any tool that let you establish an ssh connection. For instance, scp on you command line, or FileZilla if you prefer a graphical interface program.




