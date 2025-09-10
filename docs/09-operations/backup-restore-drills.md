# Backup & Restore Objectives and Drills

## Objectives
- RPO: 15 minutes (DB); 24 hours (blobs)
- RTO: 60 minutes (SEV-1)

## Backups
- Daily full + 15m WAL/incrementals
- Verify: checksum and test restore weekly

## Restore Procedures
- Spin shadow DB; restore latest snapshot + WAL
- Point staging to restored DB; run validation suite
- Promote or perform table-level recovery as needed

## Drills
- Monthly restore to staging; verify golden paths
- Quarterly chaos: simulate primary DB loss

## Documentation
- Runbooks: `09-operations/runbooks/backup_restore_procedures.txt`
- Incident templates and comms
