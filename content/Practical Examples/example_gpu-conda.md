---
title: "GPU job: RL-Medical with conda"
date: 2023-02-26T15:19:13+01:00
draft: false
weight: 4
---

Although Singularity is the recommended way to run tools on the cluster without the need of requesting administrators a system-wide installation, you can also use **[Conda](https://docs.conda.io/en/latest/)**-based installations and environments. Please note that, as with any other kind of user-level locally installed software, we can offer limited support.

## Installing Miniconda

We are going to install **[Miniconda](https://docs.conda.io/en/latest/miniconda.html)**, which is a lightweight Conda distribution. We recommend it, since Miniconda initial installation requires much less disk space than the full Conda distribution, and disk space on the cluster is a limited resource (of course, with Miniconda you can install additional packages whenever you need them).

First, we download the Miniconda installation script:

```bash
[angel@avicenna ~]$ wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
--2023-04-27 20:07:18--  https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
Resolving repo.anaconda.com (repo.anaconda.com)... 104.16.131.3, 104.16.130.3, 2606:4700::6810:8203, ...
Connecting to repo.anaconda.com (repo.anaconda.com)|104.16.131.3|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 73134376 (70M) [application/x-sh]
Saving to: ‘Miniconda3-latest-Linux-x86_64.sh’

Miniconda3-latest-Linux-x86_64 100%[===================================================>]  69.75M  23.8MB/s    in 2.9s

2023-04-27 20:07:21 (23.8 MB/s) - ‘Miniconda3-latest-Linux-x86_64.sh’ saved [73134376/73134376]
```

Now we install it:

```bash
[angel@avicenna ~]$ bash Miniconda3-latest-Linux-x86_64.sh

Welcome to Miniconda3 py310_23.3.1-0 
```

After accepting reviewing and accepting the license, confirm the default install location (which is in your home directory) and complete the installation (the remaining default options are fine, but anyway you can change them later).

Now, exit your session...
```bash
[angel@avicenna ~]$ exit

```

and log in again. You should see your command prompt indicating now that the 'base' Conda environment is activated by default:

```bash
(base) [angel@avicenna ~]$
```

You can prevent this environment to be activated on startup with this command:

```bash
conda config --set auto_activate_base false
```
Exit en log in again to check it.

## Cloning the RL-Medical Github repository

Next, we get the RL-Medical code from Github. Since in this example we are going to use the sample data that comes with the tool, we are going to place it in the `/cscratch` storage system:

```bash
[angel@avicenna ~]$ cd /cscratch/angel/tutorial/
[angel@avicenna tutorial]$ git clone https://github.com/gml16/rl-medical.git
Cloning into 'rl-medical'...
remote: Enumerating objects: 2699, done.
remote: Counting objects: 100% (275/275), done.
remote: Compressing objects: 100% (20/20), done.
remote: Total 2699 (delta 262), reused 257 (delta 255), pack-reused 2424
Receiving objects: 100% (2699/2699), 194.17 MiB | 9.38 MiB/s, done.
Resolving deltas: 100% (1693/1693), done.
Updating files: 100% (56/56), done.

```

Please remember: You should run your jobs using input data from your `/cscratch/<yourusername>` directory, and also direct your output files to your `/cscratch/<yourusername>` directory. Once your computing jobs are not using a set of data from your `/cscratch/<yourusername>` or producing data into it anymore, this specific data should be moved as soon as possible to your local device and removed from the cluster.

With the repository cloned, we get into the newly created `rl-medical` directory, and use the file 'environment.yml' to automatically create the Conda environment with all the dependencies needed to run the tool. You can find these instructions on the **[Github repository of the tool](https://github.com/gml16/rl-medical)**

```bash
[angel@avicenna tutorial]$ cd rl-medical/
[angel@avicenna rl-medical]$ conda env create -f environment.yml
Retrieving notices: ...working... done
Collecting package metadata (repodata.json): done
Solving environment: done

Downloading and Extracting Packages


...

```

Wait until all the packages are downloaded and properly installed.

## Submitting a GPGPU job

### Choosing the right SLURM partition

Remember that in order run our computing jobs, we need to submit them to **[SLURM](https://slurm.schedmd.com/)** (our cluster's resource and job management system). In this example, we need to use GPU resources to run our job, which means that we need to send the job to the right partition. In SLURM, partitions are simply sets of computing machines that are logically grouped so that SLURM can schedule and execute computing jobs on them according to some particular criteria (like availability of specific hardware resources, maximum length of the jobs, etc). In our cluster there are two partitions, as the `sinfo` command shows:

```bash
[angel@avicenna ~]$ sinfo
PARTITION AVAIL  TIMELIMIT  NODES  STATE NODELIST
regular*     up 1-00:00:00      1   idle c01
gpgpu        up 1-00:00:00      1   idle g01
```

In our case we need to use the `gpgpu` partition, since its nodes have GPU hardware resources available for SLURM to use. We can get more specific information about the `g01` node, which is a member of the `gpgpu`partition:

```bash
[angel@avicenna ~]$ scontrol show node g01
NodeName=g01 Arch=x86_64 CoresPerSocket=1
   CPUAlloc=0 CPUEfctv=24 CPUTot=24 CPULoad=0.00
   AvailableFeatures=(null)
   ActiveFeatures=(null)
   Gres=gpu:ampere:2(S:0)
   NodeAddr=g01 NodeHostName=g01 Version=22.05.2
   OS=Linux 4.18.0-372.19.1.el8_6.x86_64 #1 SMP Tue Aug 2 16:19:42 UTC 2022
   RealMemory=121856 AllocMem=0 FreeMem=127045 Sockets=24 Boards=1
   State=IDLE ThreadsPerCore=1 TmpDisk=0 Weight=1 Owner=N/A MCS_label=N/A
   Partitions=gpgpu
   BootTime=2023-02-13T21:25:58 SlurmdStartTime=2023-02-14T00:25:43
   LastBusyTime=2023-02-26T02:14:04
   CfgTRES=cpu=24,mem=119G,billing=24
   AllocTRES=
   CapWatts=n/a
   CurrentWatts=0 AveWatts=0
   ExtSensorsJoules=n/s ExtSensorsWatts=0 ExtSensorsTemp=n/s
```

Note the `Gres=gpu:ampere:2(S:0)` line, which means that this particular node has 2 GPUs (in this case, a description of the type, `ampere`, is included).

### Creating a job submission file

Essentially, there are two ways of submitting computing jobs to SLURM, an interactive and a batch mode. The latter is more flexible and less error-prone, specially for less experienced users, so it's the way we're going to use for this example.

First, we need to create a job script, which is simply a plain text file containing some SLURM directives and parameters and the actual command of the tool (or tools) to run. You can create this file using any plain text editor. You can use **[nano](https://nano-editor.org/)** or **[vim](https://www.vim.org/)** for instance, directly from the command line interface while you're connected to the cluster. Also, you can create it on your local computer and then transfer it to cluster.

For example, to create job script with the nano editor named `rl-medical_train.run` and start editing it:

```bash
[angel@avicenna ~]$ nano rl-medical_train.run

```

Please, refer to the **(nano)[https://nano-editor.org/docs.php]** documentation to learn how to use the editor if you are not familiar with it (remember that you can use any other plain text editor)

In our example, we are going to use the following contents for our job script:

```bash
#!/bin/bash

##This is an example of a simple GPU job

#SBATCH -p gpgpu       # partition name
#SBATCH -c 10            # number of CPU cores or threads requested
#SBATCH --mem 30G        # RAM requested
#SBATCH --gres=gpu:1     # Requesting to use GPU resources, and how many
#SBATCH --job-name rlmedical-train01                # Job name
#SBATCH -o job.%j.out               # File to which standard out will be written
                                    # (%j is replaced automatically by the SLURM's job ID)
#SBATCH -e job.%j.err               # File to which standard err will be written
                                    # (%j is replaced automatically by the SLURM's job ID)


## Initialize Conda and activate the rl-medical environment
. /home/${USER}/miniconda3/etc/profile.d/conda.sh
conda activate rl-medical

## Enter the directory where the main RL-Medical python script is.
## This is needed since the input filenames that RL-Medical uses as test data
## are specified using relative paths (which is NOT a specially good practice).
cd /cscratch/angel/tutorial/rl-medical/src

## Input variables. 
## (remember that any output data should be also stored in your /cscratch directory)
IMGFILES=data/filenames/image_files.txt
LANDMARKFILES=data/filenames/landmark_files.txt

## Run RL-Medical in 'train' mode and exit the conda environment
python DQN.py --task train --memory_size 30000 --init_memory_size 20000 \
--files $IMGFILES $LANDMARKFILES --model_name CommNet --file_type brain \
--landmarks 13 14 0 1 2 --multiscale --viz 0 --train_freq 50 --write

conda deactivate
```

Now let's submit our job to SLURM using the job script we've just created:

```bash
[angel@avicenna ~]$ sbatch rl-medical_train.run
Submitted batch job 208
```
Note that SLURM is reporting the ID of our job, 208.


Next we can check the state of our job:

```bash
[angel@avicenna ~]$ squeue -u angel
             JOBID PARTITION     NAME     USER ST       TIME  NODES NODELIST(REASON)
               208     gpgpu rlmedica    angel  R       1:37      1 g01
```

We can see that our job is running (note the 'R' value) on the g01 node. In case the job could not be run immediately (due to lack of resource availability at the moment, priority reasons, etc...) the state would be 'PD' (which means 'Pending'), and SLURM will keep it that way until the conditions for running it are met. Then it would be executed automatically (it would enter the 'R' state). You can find detailed information about SLURM job states in the **[SLURM documentation](https://slurm.schedmd.com/squeue.html#SECTION_JOB-STATE-CODES)**

We can format the output of the `squeue` command to get a bit more information:

```bash
[angel@avicenna ~]$ squeue -u angel -o "%.5i %.6u %.9P %.8j %.8T %.6M %.12l %.5C %.10b %.10R"
JOBID   USER PARTITION     NAME    STATE   TIME   TIME_LIMIT  CPUS TRES_PER_N NODELIST(REASON)
  208  angel     gpgpu rlmedica  RUNNING   0:51   1-00:00:00    10 gres:gpu:1        g01
```

Note the information regarding some of the resources we requested in out job sccript (10 CPUS, 1 GPU)

With the `scontrol`command we can get quite detailed information about our specific job:

```bash
[angel@avicenna ~]$ scontrol show jobid -d 208
JobId=208 JobName=rlmedical-train01
   UserId=angel(1000) GroupId=angel(1000) MCS_label=N/A
   Priority=4294901713 Nice=0 Account=(null) QOS=(null)
   JobState=RUNNING Reason=None Dependency=(null)
   Requeue=1 Restarts=0 BatchFlag=1 Reboot=0 ExitCode=0:0
   DerivedExitCode=0:0
   RunTime=00:08:49 TimeLimit=1-00:00:00 TimeMin=N/A
   SubmitTime=2023-05-02T22:06:42 EligibleTime=2023-05-02T22:06:42
   AccrueTime=2023-05-02T22:06:42
   StartTime=2023-05-02T22:06:43 EndTime=2023-05-03T22:06:43 Deadline=N/A
   SuspendTime=None SecsPreSuspend=0 LastSchedEval=2023-05-02T22:06:43 Scheduler=Main
   Partition=gpgpu AllocNode:Sid=avicenna:2636496
   ReqNodeList=(null) ExcNodeList=(null)
   NodeList=g01
   BatchHost=g01
   NumNodes=1 NumCPUs=10 NumTasks=1 CPUs/Task=10 ReqB:S:C:T=0:0:*:*
   TRES=cpu=10,mem=30G,node=1,billing=10
   Socks/Node=* NtasksPerN:B:S:C=0:0:*:* CoreSpec=*
   JOB_GRES=gpu:ampere:1
     Nodes=g01 CPU_IDs=0-9 Mem=30720 GRES=gpu:ampere:1(IDX:0)
   MinCPUsNode=10 MinMemoryNode=30G MinTmpDiskNode=0
   Features=(null) DelayBoot=00:00:00
   OverSubscribe=OK Contiguous=0 Licenses=(null) Network=(null)
   Command=/home/angel/rl-medical_train.run
   WorkDir=/home/angel
   StdErr=/home/angel/job.208.err
   StdIn=/dev/null
   StdOut=/home/angel/job.208.out
   Power=
   TresPerNode=gres:gpu:1
```

Additionally, we can get monitoring information of the gpu usage of the with the `nvidia-smi`tool. We can use the `srun` command (which allows to submit jobs to SLURM interactively) to attach the ID of our job to `nvidia-smi`:

```bash
[angel@avicenna ~]$ srun --jobid 208 nvidia-smi
Tue May  2 22:22:27 2023
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 515.43.04    Driver Version: 515.43.04    CUDA Version: 11.7     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|                               |                      |               MIG M. |
|===============================+======================+======================|
|   0  NVIDIA GeForce ...  Off  | 00000000:43:00.0 Off |                  N/A |
| 30%   35C    P8    11W / 350W |    543MiB / 24576MiB |      0%      Default |
|                               |                      |                  N/A |
+-------------------------------+----------------------+----------------------+
|   1  NVIDIA GeForce ...  Off  | 00000000:88:00.0 Off |                  N/A |
| 30%   40C    P0   101W / 350W |      0MiB / 24576MiB |      0%      Default |
|                               |                      |                  N/A |
+-------------------------------+----------------------+----------------------+

+-----------------------------------------------------------------------------+
| Processes:                                                                  |
|  GPU   GI   CI        PID   Type   Process name                  GPU Memory |
|        ID   ID                                                   Usage      |
|=============================================================================|
|    0   N/A  N/A    101488      C   python                            541MiB |
+-----------------------------------------------------------------------------+
```


Note that in this way, we are submitting an additional job step to SLURM, but using the same allocated resources of your original job (anyway the required resources for the `nvidia-smi`job step should be minimal and should not noticeably influence your original job performance).

As the output above shows, we can get detailed information about the GPUs usage on the node our job is running on. We can see that our job is running on the first GPU out of the two installed, the GPU memory usage, temperature, wattage, etc... 


