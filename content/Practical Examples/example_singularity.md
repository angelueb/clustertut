---
title: "Singularity: Quasi-mapping RNA-Seq quantification"
date: 2023-02-26T15:19:13+01:00
draft: false
weight: 3
---

The use of **[Singularity](https://sylabs.io/singularity/)** containers is supported in the cluster. In contrast to other container technologies, Singularity is a good fit to HPC environments, since:
* Singularity containers don't need administrative privileges to be executed.
* Performance levels are very close to regular binaries.
* Compatibility with Docker images, which enables the use of a huge number of readily available existing containerized tools.
* Container building tools similar to Docker. Users can build custom containers using already acquired general principles.
* Singularity containers mount several common common storage locations, like `$HOME`. Also, in our cluster they are configured to mount `/cscratch` automatically.

One of the main aims and uses of Singularity is to bring containers and reproducibility to scientific computing and high-performance computing (HPC)[^1]

For these reasons, Singularity is great for running tools on the cluster without having to request the administrators to install them system-wide. Users can simply pull existing images from public repositories, or build their own. This simplifies the use of tools with complex dependencies in particular, without having to rely on system-wide installations of specific components and versions. In addition, containers enable an easier reproducibility control, given that the gathering and building of the components can be registered systematically. Once ready, the containers can be run as SLURM jobs, in a very similar fashion to running regular binaries.


In this example, we will use the latest version of **[Salmon](https://combine-lab.github.io/salmon/)** from a Singularity container to perform a quasi-mapping quantification of the reads that we pre-processed in the previous example.

## Getting a Singularity image

First let's load the Singularity module:

```bash
[angel@avicenna ~]$ module load singularity

```

Next, we need a container image for Salmon. The developers maintain an official Docker image, hosted at [Docker Hub](https://hub.docker.com/). Let's use Singularity to fetch it and convert it to `.sif` format (the native Singularity format) in just one simple command:

```bash
[angel@avicenna ~]$ singularity pull docker://combinelab/salmon:1.10.0
```

This will download the original image, convert it to .sif format and save it to `salmon_1.10.0.sif` in the current directory:

```bash
-rwxrwxr-x   1 angel angel 42672128 Feb 26 22:00  salmon_1.10.0.sif

```
{{% notice style="info" %}}
The **[Biocontainers](https://biocontainers.pro/)** project provides free and readily available containers for **thousands** of bioinformatics tools. You can get their Docker images directly from their [Quay.io](https://quay.io/organization/biocontainers) space. For instance:

```bash
[angel@avicenna ~]$ singularity pull docker://quay.io/biocontainers/bowtie2:2.5.1--py310h8d7afc0_0
```

Also, the **[Galaxy Project](https://galaxyproject.org/)** (both projects are related) maintains a [repository](https://depot.galaxyproject.org/singularity/) containing all the Biocontainers images already converted to the Singularity native format. For instance:

```bash
[angel@avicenna ~]$ singularity pull https://depot.galaxyproject.org/singularity/bowtie2:2.5.1--py310h8d7afc0_0
```
{{% /notice %}}

## Getting our transcriptome 

We could automate the following steps but for clarity we are goint to show them as done manually.

Download Rat cDNA (doesn't contain ncRNA sequences):
```bash
[angel@avicenna dades]$ wget ftp://ftp.ensembl.org/pub/release-101/fasta/rattus_norvegicus/cdna/Rattus_norvegicus.Rnor_6.0.cdna.all.fa.gz
```

Download Rat ncRNA:

```bash
[angel@avicenna dades]$ wget ftp://ftp.ensembl.org/pub/release-101/fasta/rattus_norvegicus/ncrna/Rattus_norvegicus.Rnor_6.0.ncrna.fa.gz
```

Concatenate both files into a single compressed fasta:

```bash
[angel@avicenna dades]$ zcat Rattus_norvegicus.Rnor_6.0.cdna.all.fa.gz Rattus_norvegicus.Rnor_6.0.ncrna.fa.gz >Rattus_norvegicus.Rnor_6.0.cdna.ncrna.fa.gz
```

We also download the gene annotations (both coding and non coding RNA):

```bash
[angel@avicenna dades]$ wget ftp://ftp.ensembl.org/pub/release-102/gtf/rattus_norvegicus/Rattus_norvegicus.Rnor_6.0.102.gtf.gz
```

## Building indices with Salmon

We can now use Salmon to build the transcriptome indices which we'll be using later for our quasi-mapping quantification. Let's prepare a file for `sbatch`:

```bash
#!/bin/bash

##This is a good example of a single-process multi-threaded job

#SBATCH -p regular       # partition name
#SBATCH -c 8             # number of cores or threads requested, PER EACH TASK of the array
#SBATCH --mem 10G        # RAM requested, per each task again
#SBATCH --job-name salmon-index01                # Job name
#SBATCH -o job.%j.out               # File to which standard out will be written
#SBATCH -e job.%j.err               # File to which standard err will be written

## Base directory for job input and output data (on /cscratch)
TUTORIAL=/cscratch/angel/tutorial

## Input, output variables
TRANSCRFN=${TUTORIAL}/dades/Rattus_norvegicus.Rnor_6.0.cdna.ncrna.fa.gz
INDEXFN=${TUTORIAL}/dades/Rattus_norvegicus.Rnor_6.0.cdna.ncrna_index

## Run Salmon for creating the index
salmon_1.10.0.sif index --threads 8 -t $TRANSCRFN -i $INDEXFN

```

As you can see it's a pretty simple batch submission file. Let's submit it to SLURM:

```bash
[angel@avicenna ~]$ sbatch salmon_index.run 
Submitted batch job 67

```
Let's check the queues:

```bash
[angel@avicenna ~]$ squeue -u angel -o "%.13i %.6u %.9P %.8j %.8T %.6M %.12l %.5C %.10R"
        JOBID   USER PARTITION     NAME    STATE   TIME   TIME_LIMIT  CPUS NODELIST(REASON)
          67  angel   regular salmon-i  RUNNING   0:03   1-00:00:00     8        c01
```

After the job finishes, we have aour inices created:

```bash
[angel@avicenna ~]$ cd /cscratch/angel/tutorial/dades/Rattus_norvegicus.Rnor_6.0.cdna.ncrna_index/
[angel@avicenna Rattus_norvegicus.Rnor_6.0.cdna.ncrna_index]$ ls
complete_ref_lens.bin  duplicate_clusters.tsv  pos.bin           refAccumLengths.bin  refseq.bin
ctable.bin             info.json               pre_indexing.log  ref_indexing.log     seq.bin
ctg_offsets.bin        mphf.bin                rank.bin          reflengths.bin       versionInfo.json
```

## Quasi-mapping quantification

Now that our indices are ready, we can proceed to run Salmon in mapping-based mode to obtain a quasi-mapping quantification.

Since our input reads are paired-end ones, we have a pair of files per each sample. We are going to use the SLURM's [Job Array](https://slurm.schedmd.com/job_array.html) feature to automatically submit all the required Salmon tasks for execution  (taking advantage of the serialized sample prefix of the files' names). 

Let's remember this naming pattern of the input files:


```bash
[angel@avicenna ~]$ ls /cscratch/angel/tutorial/dades/cutadapt_results/
1244_lib_09628AAB_ATCACG_1_TRIM.fastq.gz  1260_lib_09637AAB_TAGCTT_2_TRIM.fastq.gz
1244_lib_09628AAB_ATCACG_2_TRIM.fastq.gz  1261_lib_09638AAB_GGCTAC_1_TRIM.fastq.gz
1245_lib_09641AAB_ATGTCA_1_TRIM.fastq.gz  1261_lib_09638AAB_GGCTAC_2_TRIM.fastq.gz
1245_lib_09641AAB_ATGTCA_2_TRIM.fastq.gz  1262_lib_09656AAB_CCAACA_1_TRIM.fastq.gz
1246_lib_09629AAB_CGATGT_1_TRIM.fastq.gz  1262_lib_09656AAB_CCAACA_2_TRIM.fastq.gz
1246_lib_09629AAB_CGATGT_2_TRIM.fastq.gz  1263_lib_09639AAB_CTTGTA_1_TRIM.fastq.gz
1247_lib_09648AAB_AGTTCC_1_TRIM.fastq.gz  1263_lib_09639AAB_CTTGTA_2_TRIM.fastq.gz
1247_lib_09648AAB_AGTTCC_2_TRIM.fastq.gz  1264_lib_09657AAB_CGGAAT_1_TRIM.fastq.gz
1248_lib_09649AAB_GGTAGC_1_TRIM.fastq.gz  1264_lib_09657AAB_CGGAAT_2_TRIM.fastq.gz
1248_lib_09649AAB_GGTAGC_2_TRIM.fastq.gz  1265_lib_09640AAB_AGTCAA_1_TRIM.fastq.gz
1249_lib_09630AAB_TTAGGC_1_TRIM.fastq.gz  1265_lib_09640AAB_AGTCAA_2_TRIM.fastq.gz
1249_lib_09630AAB_TTAGGC_2_TRIM.fastq.gz  1266_lib_09653AAB_CAGGCG_1_TRIM.fastq.gz
1250_lib_09631AAB_TGACCA_1_TRIM.fastq.gz  1266_lib_09653AAB_CAGGCG_2_TRIM.fastq.gz
1250_lib_09631AAB_TGACCA_2_TRIM.fastq.gz  1267_lib_09642AAB_CCGTCC_1_TRIM.fastq.gz
1251_lib_09632AAB_ACAGTG_1_TRIM.fastq.gz  1267_lib_09642AAB_CCGTCC_2_TRIM.fastq.gz
1251_lib_09632AAB_ACAGTG_2_TRIM.fastq.gz  1268_lib_09658AAB_CTAGCT_1_TRIM.fastq.gz
1252_lib_09650AAB_ACTGAT_1_TRIM.fastq.gz  1268_lib_09658AAB_CTAGCT_2_TRIM.fastq.gz
1252_lib_09650AAB_ACTGAT_2_TRIM.fastq.gz  1270_lib_09643AAB_GTCCGC_1_TRIM.fastq.gz
1253_lib_09651AAB_ATTCCT_1_TRIM.fastq.gz  1270_lib_09643AAB_GTCCGC_2_TRIM.fastq.gz
1253_lib_09651AAB_ATTCCT_2_TRIM.fastq.gz  1271_lib_09644AAB_GTGAAA_1_TRIM.fastq.gz
1254_lib_09655AAB_CATTTT_1_TRIM.fastq.gz  1271_lib_09644AAB_GTGAAA_2_TRIM.fastq.gz
1254_lib_09655AAB_CATTTT_2_TRIM.fastq.gz  1272_lib_09645AAB_GTTTCG_1_TRIM.fastq.gz
1255_lib_09652AAB_CAACTA_1_TRIM.fastq.gz  1272_lib_09645AAB_GTTTCG_2_TRIM.fastq.gz
1255_lib_09652AAB_CAACTA_2_TRIM.fastq.gz  1273_lib_09646AAB_CGTACG_1_TRIM.fastq.gz
1256_lib_09633AAB_GCCAAT_1_TRIM.fastq.gz  1273_lib_09646AAB_CGTACG_2_TRIM.fastq.gz
1256_lib_09633AAB_GCCAAT_2_TRIM.fastq.gz  1274_lib_09654AAB_CATGGC_1_TRIM.fastq.gz
1257_lib_09634AAB_CAGATC_1_TRIM.fastq.gz  1274_lib_09654AAB_CATGGC_2_TRIM.fastq.gz
1257_lib_09634AAB_CAGATC_2_TRIM.fastq.gz  1275_lib_09647AAB_GAGTGG_1_TRIM.fastq.gz
1258_lib_09635AAB_ACTTGA_1_TRIM.fastq.gz  1275_lib_09647AAB_GAGTGG_2_TRIM.fastq.gz
1258_lib_09635AAB_ACTTGA_2_TRIM.fastq.gz  1278_lib_09659AAB_CTATAC_1_TRIM.fastq.gz
1259_lib_09636AAB_GATCAG_1_TRIM.fastq.gz  1278_lib_09659AAB_CTATAC_2_TRIM.fastq.gz
1259_lib_09636AAB_GATCAG_2_TRIM.fastq.gz  1279_lib_09660AAB_CTCAGA_1_TRIM.fastq.gz
1260_lib_09637AAB_TAGCTT_1_TRIM.fastq.gz  1279_lib_09660AAB_CTCAGA_2_TRIM.fastq.gz
```

So let's prepare a sbatch job submission file accordingly:

```bash
#!/bin/bash

##This is a good example of a single-process multi-threaded Job Array

#SBATCH -p regular       # partition name
#SBATCH -c 10            # number of cores or threads requested, PER EACH TASK of the array
#SBATCH --mem 128G       # RAM requested, per each task again
#SBATCH --job-name salmon-quant01      # Job name
#SBATCH -o job.%A_%a.out               # File to which standard out will be written
#SBATCH -e job.%A_%a.err               # File to which standard err will be written

#SBATCH --array=44-79%3  # Define this job as an array.
                         # We use the samples number as range.
                         # The %3 specifies the concurrent tasks.


## Base directory for job input and output data (on /cscratch
TUTORIAL=/cscratch/angel/tutorial

## Input, output and index variables
INDIR=${TUTORIAL}/dades/cutadapt_results
OUTDIR=${TUTORIAL}/dades/salmon_quant_results_cdna_ncrna
INDEXFILE=${TUTORIAL}/dades/Rattus_norvegicus.Rnor_6.0.cdna.ncrna_index

## Using the array task ID to extract the full sample name of the file pairs
PAIR1=$(ls ${INDIR}/12${SLURM_ARRAY_TASK_ID}*_1_TRIM.fastq.gz)
SAMPLE=$(basename ${PAIR1} _1_TRIM.fastq.gz)


## Run Salmon for each pair.
## This is the Salmon command line for each iteration of the array
./salmon_1.10.0.sif salmon quant -i $INDEXFILE -l A \
         -1 $INDIR/${SAMPLE}_1_TRIM.fastq.gz \
         -2 $INDIR/${SAMPLE}_2_TRIM.fastq.gz \
         --gcBias \
         --seqBias \
         --validateMappings \
         -p 10 -o $OUTDIR/${SAMPLE}_quant


```

Lets pay attention to the following snippets:

* `#SBATCH -o job.%A_%a.out` and `#SBATCH -e job.%A_%a.err`: In a Job Array, %A is replaced by the Array Job ID and %a is replaced by the each Array Task ID.
* `#SBATCH --array=44-79%3`specifies the lower and upper digits of the job array task range, and the '%3' means that 3 of the tasks can run at the same time at most (if there are enough available resources for them)

We can submit now our job array:

```bash
[angel@avicenna ~]$ sbatch salmon_quant.run 
Submitted batch job 107
```

Let's check the status of our job:

```bash
[angel@avicenna ~]$ squeue -u angel -o "%.13i %.6u %.9P %.8j %.8T %.6M %.12l %.5C %.10R"
        JOBID   USER PARTITION     NAME    STATE   TIME   TIME_LIMIT  CPUS NODELIST(REASON)
107_[47-79%3]  angel   regular salmon-q  PENDING   0:00   1-00:00:00    10 (JobArrayT
       107_44  angel   regular salmon-q  RUNNING   1:54   1-00:00:00    10        c01
       107_45  angel   regular salmon-q  RUNNING   1:54   1-00:00:00    10        c01
       107_46  angel   regular salmon-q  RUNNING   1:54   1-00:00:00    10        c01

```
We can see that we have the first 3 tasks running at the smae time, each one using 10 cores. Also note the `107_[47-79%3]` job ID whith 'PENDING' state, which are the remaining tasks waiting to be executed.

And if we check again a couple of minutes after:

```bash
[angel@avicenna ~]$ squeue -u angel -o "%.13i %.6u %.9P %.8j %.8T %.6M %.12l %.5C %.10R"
        JOBID   USER PARTITION     NAME    STATE   TIME   TIME_LIMIT  CPUS NODELIST(REASON)
107_[50-79%3]  angel   regular salmon-q  PENDING   0:00   1-00:00:00    10 (JobArrayT
       107_49  angel   regular salmon-q  RUNNING   0:00   1-00:00:00    10        c01
       107_48  angel   regular salmon-q  RUNNING   0:03   1-00:00:00    10        c01
       107_47  angel   regular salmon-q  RUNNING   0:05   1-00:00:00    10        c01
```

Note that now the next 3 tasks are running (47, 48 and 49), since the 3 previous ones finished.

We can also check the `scontrol` information for the job (truncated):

```bash
[angel@avicenna ~]$ scontrol show jobid -d 107
JobId=107 ArrayJobId=107 ArrayTaskId=57-79%3 ArrayTaskThrottle=3 JobName=salmon-quant01
   UserId=angel(1000) GroupId=angel(1000) MCS_label=N/A
   Priority=4294901744 Nice=0 Account=(null) QOS=(null)
   JobState=PENDING Reason=JobArrayTaskLimit Dependency=(null)
   Requeue=1 Restarts=0 BatchFlag=1 Reboot=0 ExitCode=0:0
   DerivedExitCode=0:0
   RunTime=00:00:00 TimeLimit=1-00:00:00 TimeMin=N/A
   SubmitTime=2023-02-27T01:25:30 EligibleTime=Unknown
   AccrueTime=2023-02-27T01:25:31
   StartTime=Unknown EndTime=Unknown Deadline=N/A
   SuspendTime=None SecsPreSuspend=0 LastSchedEval=2023-02-27T01:36:38 Scheduler=Main
   Partition=regular AllocNode:Sid=avicenna:1464201
   ReqNodeList=(null) ExcNodeList=(null)
   NodeList=(null)
   NumNodes=1 NumCPUs=10 NumTasks=1 CPUs/Task=10 ReqB:S:C:T=0:0:*:*
   TRES=cpu=10,mem=128G,node=1,billing=10
   Socks/Node=* NtasksPerN:B:S:C=0:0:*:* CoreSpec=*
   MinCPUsNode=10 MinMemoryNode=128G MinTmpDiskNode=0
   Features=(null) DelayBoot=00:00:00
   OverSubscribe=OK Contiguous=0 Licenses=(null) Network=(null)
   Command=/home/angel/salmon_quant.run
   WorkDir=/home/angel
   StdErr=/home/angel/job.107_4294967294.err
   StdIn=/dev/null
   StdOut=/home/angel/job.107_4294967294.out
   Power=
   

JobId=120 ArrayJobId=107 ArrayTaskId=56 ArrayTaskThrottle=3 JobName=salmon-quant01
   UserId=angel(1000) GroupId=angel(1000) MCS_label=N/A
   Priority=4294901744 Nice=0 Account=(null) QOS=(null)
   JobState=RUNNING Reason=None Dependency=(null)
   Requeue=1 Restarts=0 BatchFlag=1 Reboot=0 ExitCode=0:0
   DerivedExitCode=0:0
   RunTime=00:00:38 TimeLimit=1-00:00:00 TimeMin=N/A
   SubmitTime=2023-02-27T01:25:30 EligibleTime=2023-02-27T01:36:38
   AccrueTime=2023-02-27T01:25:31
   StartTime=2023-02-27T01:36:38 EndTime=2023-02-28T01:36:38 Deadline=N/A
   SuspendTime=None SecsPreSuspend=0 LastSchedEval=2023-02-27T01:36:38 Scheduler=Main
   Partition=regular AllocNode:Sid=avicenna:1464201
   ReqNodeList=(null) ExcNodeList=(null)
   NodeList=c01
   BatchHost=c01
   NumNodes=1 NumCPUs=10 NumTasks=1 CPUs/Task=10 ReqB:S:C:T=0:0:*:*
   TRES=cpu=10,mem=128G,node=1,billing=10
   Socks/Node=* NtasksPerN:B:S:C=0:0:*:* CoreSpec=*
   JOB_GRES=(null)
     Nodes=c01 CPU_IDs=20-29 Mem=131072 GRES=
   MinCPUsNode=10 MinMemoryNode=128G MinTmpDiskNode=0
   Features=(null) DelayBoot=00:00:00
   OverSubscribe=OK Contiguous=0 Licenses=(null) Network=(null)
   Command=/home/angel/salmon_quant.run
   WorkDir=/home/angel
   StdErr=/home/angel/job.107_56.err
   StdIn=/dev/null
   StdOut=/home/angel/job.107_56.out
   Power=
   

JobId=119 ArrayJobId=107 ArrayTaskId=55 ArrayTaskThrottle=3 JobName=salmon-quant01
   UserId=angel(1000) GroupId=angel(1000) MCS_label=N/A
   Priority=4294901744 Nice=0 Account=(null) QOS=(null)
   JobState=RUNNING Reason=None Dependency=(null)
   Requeue=1 Restarts=0 BatchFlag=1 Reboot=0 ExitCode=0:0
   DerivedExitCode=0:0
   RunTime=00:02:50 TimeLimit=1-00:00:00 TimeMin=N/A
   SubmitTime=2023-02-27T01:25:30 EligibleTime=2023-02-27T01:34:26
   AccrueTime=2023-02-27T01:25:31
   StartTime=2023-02-27T01:34:26 EndTime=2023-02-28T01:34:26 Deadline=N/A
   SuspendTime=None SecsPreSuspend=0 LastSchedEval=2023-02-27T01:34:26 Scheduler=Main
   Partition=regular AllocNode:Sid=avicenna:1464201
   ReqNodeList=(null) ExcNodeList=(null)
   NodeList=c01
   BatchHost=c01
   NumNodes=1 NumCPUs=10 NumTasks=1 CPUs/Task=10 ReqB:S:C:T=0:0:*:*
   TRES=cpu=10,mem=128G,node=1,billing=10
   Socks/Node=* NtasksPerN:B:S:C=0:0:*:* CoreSpec=*
   JOB_GRES=(null)
     Nodes=c01 CPU_IDs=10-19 Mem=131072 GRES=
   MinCPUsNode=10 MinMemoryNode=128G MinTmpDiskNode=0
   Features=(null) DelayBoot=00:00:00
   OverSubscribe=OK Contiguous=0 Licenses=(null) Network=(null)
   Command=/home/angel/salmon_quant.run
   WorkDir=/home/angel
   StdErr=/home/angel/job.107_55.err
   StdIn=/dev/null
   StdOut=/home/angel/job.107_55.out
   Power=

```

As you can see, the output shows information about the jobs and about the individual tasks.


[^1]:Kurtzer, Gregory M.; Sochat, Vanessa; Bauer, Michael W. (2017). ["Singularity: Scientific Containers for Mobility of Compute"](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5426675/). PLOS ONE. 12 (5): e0177459