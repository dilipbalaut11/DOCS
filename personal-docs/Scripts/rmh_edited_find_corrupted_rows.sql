BEGIN TRANSACTION;

CREATE TABLE edb_corrupted_rows(schemaname TEXT,
								tablename TEXT,
								t_ctid TID,
								sqlstate TEXT,
								sqlerrm TEXT);

CREATE OR REPLACE FUNCTION check_table_row_corruption(schemaname TEXT, tablename TEXT) RETURNS VOID AS $$
DECLARE
	rec RECORD;
	tmp RECORD;
	tmp_text TEXT;
BEGIN
	FOR rec IN EXECUTE format($q$
		SELECT '(' || b || ','|| generate_series(0,292) || ')' AS generated_tid
			FROM generate_series(0, pg_relation_size('%I.%I')/current_setting('block_size')::integer) b
	$q$, schemaname, tablename)
	LOOP
	BEGIN
		BEGIN
			EXECUTE 'SELECT * FROM '
					|| quote_ident(schemaname) || '.' || quote_ident(tablename)
					|| ' WHERE ctid = ''' || rec.generated_tid || '''::tid'
				INTO tmp;

			tmp_text := tmp::text;
		EXCEPTION WHEN OTHERS THEN
		BEGIN
			INSERT INTO edb_corrupted_rows VALUES(schemaname, tablename, rec.generated_tid::tid, SQLSTATE::text, SQLERRM::text);
		END;
		END;
	END;
	END LOOP;
END;
$$ LANGUAGE PLPGSQL;

COMMIT TRANSACTION;


CREATE OR REPLACE FUNCTION check_table_row_corruption(schemaname TEXT, tablename TEXT)
 RETURNS VOID AS $$
 DECLARE
BeerseProd$# rec RECORD;
BeerseProd$# tmp RECORD;
BeerseProd$# t_ctid TID;
BeerseProd$# tmp_text TEXT;
BeerseProd$# BEGIN
BeerseProd$# FOR rec IN EXECUTE 'SELECT ctid
BeerseProd$# FROM ' || quote_ident(schemaname) || '.' || quote_ident(tablename)
BeerseProd$# LOOP
BeerseProd$# BEGIN
BeerseProd$# t_ctid := rec.ctid;
BeerseProd$# BEGIN
BeerseProd$# EXECUTE 'SELECT * FROM '
BeerseProd$# || quote_ident(schemaname) || '.' || quote_ident(tablename)
BeerseProd$# || ' WHERE ctid = ''' || t_ctid || '''::tid'
BeerseProd$# INTO STRICT tmp;
BeerseProd$# tmp_text := tmp::text;
BeerseProd$# EXCEPTION WHEN OTHERS THEN
BeerseProd$# BEGIN
BeerseProd$# INSERT INTO edb_corrupted_rows VALUES(schemaname, tablename, t_ctid, SQLSTATE::text,
BeerseProd$# SQLERRM::text);
BeerseProd$# COMMIT;
BeerseProd$# END;
BeerseProd$# END;
BeerseProd$# END;
BeerseProd$# END LOOP;
BeerseProd$# END;
BeerseProd$# $$ LANGUAGE PLPGSQL;