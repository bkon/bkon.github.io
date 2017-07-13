---
layout: post
title: Ivory tower infrastructure checklist
categories: infrastructure
tags: aws devops
excerpt:
  |
    <p>A long list of questions to ask yourself when architecting
    an AWS cloud solution.</p>
---

## Change management

* All infrastructure changes are tracked in the version control
  system
* IAM changes are tracked in the version control system

## Continuous deployment

* Keys used for infrastructure change deployments are limited to
  the single stack we're depoying to
* All services are deployed as binary artifacts
* All binary artifacts are versioned (and history of several most
  recent versions is kept accessible)
* CI does not have access to IAM

## Protocols / network

* Web / API instances are available through HTTP(s)
* NTP works on your instances (ingress UDP 123)
* LB instances have ALB ingress ports (31000 - 61000) open
* LB has incoming HTTPS open
* LB does not have incoming HTTP (serious, why should it?)
* Cache is accessible from your app / web instances
* DB is accessible from your app / web instances
* Instances have inbound ephemeral ports (1024-65535) allows on
  stateless firewall (EC2::NetworkAclEntry)

## Organizational structure

* Staging / testing and production accounts are physically separate
* Relationships between accounts are configured through AWS Organizations
* There's no duplication across accounts; users can assume roles to access
  child AWS accounts.

## Staging environments

* Data in my staging environment is anonymized
* Data is my staging environment is up to date with or
  at least closely resembles production data
* Data in the staging environment is update automatically

## Route 53

* each environment has a CloudFormation-managed Route53 record (or several)
  pointing to this environment;
* Production DNS records is a CNAME for the environment-specific domain;
* Applicaton does not listen on the domain apex;
* Apex domain is mapped to S3 website redirect to the application domain.

## Edge services

* Production environment is completely hidden behind an edge service (CloudFront)
* Static assets are served directly from S3 origin with aggressive caching;
* All CloudFront distributions have a CNAME in Route53; application
  does not generate links pointing directly to the cloufront domain.

## Load balancers

* Unhealthy thresholds are sufficient to allow slow application start-up time

## Disaster recovery

* RDS instances use multi-AZ deployments with standby replicas
* Worker / web services use multi-AZ deployments
* RDS instances have automated snapshots enabled with enough retention time
* Critical assets on S3 have versioning / lifecycle rules
* CloudFormation resources related to data storage are protected from
  replacement and deletion with stack policies
* I can create a new environment from scratch in automated fashion

## Security

* Database instances are locked inside a private subnet
* Cache instances are locked inside a private subnet
* Internal API instances are not publicly accessible
* Instances behind LBs are accessible to these LBs only
* There's no SSH access to my production EC2 instances
* Production environment account is completely locked up or
  has a minimal number of users who *need* to access it.
* Data in S3 buckets is private by default; publicly available resources
  need to be explicitly marked as such.
* Sensitive data (e.g. environment parameters) is encrypted at rest

## Alerts and triage

* All application logs are collected to centralized storage
* All EC2 instance logs are collected to centralized storage
* All services will scale automatically if number of healthy hosts drops
  below norm
* Queue workers will scale automatically if number of pending items in the
  queue grows above a certain number
* An email notification is sent if any service has low amount of healhy hosts
  longer than a few minutes
* An email notification is sent if the number of pending items in the queue
  stays high for long

## ECS

* ECS tasks are distributed across instances / availability zones
