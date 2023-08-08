# Architecture 

## High-Level Architecture 
The current design and packaging of RunWhen Local is such that it can be deployed as a single container into any container runtime or Kubernetes environment. This would support users who wish to run this locally on their laptop, or deployed in a self-managed cluster, whichever is easier for the user. All data that RunWhen Local collects is stored locally and does not interact with any other RunWhen Platform API **unless it intentionally uploaded for the purposes of onboarding to RunWhen Platform**. 

![](../assets/architecture-high-level.excalidraw.png)
