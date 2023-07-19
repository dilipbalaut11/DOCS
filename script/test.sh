The system may run more slowly during the checkpoint, since a lot of data may be getting written to disk very quickly, but it will still be up and accepting connections, which is a good thing if that checkpoint takes multiple minutes to complete.  Only once that checkpoint is done do we begin shutting down.  The fast shutdown will perform a second checkpoint, but that one will generally completely pretty quickly since it gets run right after the first one, and therefore won't have much new, dirty data to write out.

There's an interesting terminological difference between PostgreSQL and Oracle around shutdown modes.  In Oracle, what PostgreSQL calls a "smart" shutdown is instead called a "normal" shutdown.  Due to the fact that such a shutdown may take an exceedingly long time to complete, both terms are perhaps a misnomer; in this era of nonstop data processing, "dumb" or "neverending" might be a more apt moniker.  Still, the terms are fairly similar, and perhaps reflectthe expectations of the time period in which they were invented.  More confusingly, what PostgreSQL calls a "fast" shutdown is referred to as an "immediate" shutdown in Oracle; but our"immediate" shutdown is what Oracle calls an "abort".  This can lead DBAs familiar with Oracle to issue an "immediate" shutdown against PostgreSQL when what they really intended was what we call a "fast" shutdown.

Robert Haas is Chief Architect, Database Server at EnterpriseDB and is a PostgreSQL Major Contributor and Committer.


Robert M. Haas
Robert is a 15-year database industry veteran and has been a major contributor to the PostgreSQL Global Development Group since 2008. He joined EDB in 2010 after spending just over two years with SNiP as Director of Business Engineering. Prior to that he was a Senior Systems Analyst with ...

Popular Posts
Connecting PostgreSQL using psql and pgAdmin
How to use PostgreSQL with Django
Microsoft SQL Server (MSSQL) vs. PostgreSQL Comparison in Details - What are the Differences? [2020]
10 Examples of PostgreSQL Stored Procedures
How to Install Postgres on Docker