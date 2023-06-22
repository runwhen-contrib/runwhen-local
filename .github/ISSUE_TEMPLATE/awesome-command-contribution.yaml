---
name: Awesome Command Contribution
about: Share your favorite troubleshooting command and help improve the community's experience!
title: "[awesome-command-contribution] "
labels: ["runwhen-local", "awesome-command-contribution"] 
assignees: 
  - stewartshea
body: 
  - type: markdown
    attributes:
      value: |
        Hello there 🎉! We're excited to hear about your favorite troubleshooting command. Your contribution will make a big difference in improving the community's experience with Kubernetes and cloud environments. Feel free to add as much or as little detail below, and our team will integrate your awesome command.
        
        Remember, every contribution is highly appreciated! Let's make navigating complex environments easier together!
        
        If you're open to being contacted with follow-up questions, please place an [x] beside 'yes, please' at the end of the form. Happy sharing! 😊

  - type: textarea
    id: awesome-command
    attributes:
      label: Awesome Command?
      description: What is your awesome command? Most commands are focused on command line tools like kubectl, curl, gcloud, aws, argo, flux, and more. We'll do our best to add all new command line binaries.
      placeholder: kubectl api-resources --verbs=list --namespaced -o name --context=sandbox-cluster-1 | xargs -n 1 kubectl get --show-kind --ignore-not-found -n jenkins --context=sandbox-cluster-1
      value: "My awesome command here!"
    validations:
      required: true

  - type: textarea
    id: what-does-it-do
    attributes:
      label: What does it do?
      description: In one sentence, describe what the task accomplishes. This will show up as the "Task Title."
      placeholder: Get Listing Of Resources In Namespace
      value: "It helps us troubleshoot all the things"
    validations:
      required: false

  - type: textarea
    id: when-to-run
    attributes:
      label: When would you run this?
      description: Please provide a description of the situations in which you would use this command.
      placeholder: Useful when trying to see ALL resources that exist in a namespace while troubleshooting issues with a non-terminating namespace.
      value: "When namespaces are having problems terminating due to stuck resources"
    validations:
      required: false

  - type: textarea
    id: additional-context
    attributes:
      label: Any other helpful context?
      description: Provide any additional context surrounding this command, such as specific circumstances or dependencies that make it particularly useful.
      placeholder: This command is most effective when the user has access to list/get all possible resources within the namespace.
      value: "Best run by namespace or cluster admins"
    validations:
      required: false

  - type: dropdown
    id: contact
    attributes:
      label: Contact
      description: Are you willing to be contacted for additional questions? 
      options:
        - Yes, please
        - No, thanks


  - type: markdown
    attributes:
      value: |
        You're done🎉! Woohoo! Thanks for taking the time to share your awesome commands with the community! We appreciate your contribution!
