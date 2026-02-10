namespace WebApp;

public static class DbQuery
{
    // Setup the database connection from config
    private static string connectionString;

    // JSON columns for _CONTAINS_ validation
    public static Arr JsonColumns = Arr(new[] { "categories" });

    public static bool IsJsonColumn(string column) => JsonColumns.Includes(column);

    static DbQuery()
    {
        var configPath = Path.Combine(
            AppContext.BaseDirectory, "..", "..", "..", "db-config.json"
        );
        var configJson = File.ReadAllText(configPath);
        var config = JSON.Parse(configJson);

        connectionString =
            $"Server={config.host};Port={config.port};Database={config.database};" +
            $"User={config.username};Password={config.password};";

        var db = new MySqlConnection(connectionString);
        db.Open();

        // Create tables if they don't exist
        if (config.createTablesIfNotExist == true)
        {
            CreateTablesIfNotExist(db);
        }

        // Seed data if tables are empty
        if (config.seedDataIfEmpty == true)
        {
            SeedDataIfEmpty(db);
        }

        db.Close();
    }

    private static void CreateTablesIfNotExist(MySqlConnection db)
    {
        var createTablesSql = @"
            CREATE TABLE IF NOT EXISTS sessions (
                id VARCHAR(255) PRIMARY KEY NOT NULL,
                created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                modified DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                data JSON
            );

            CREATE TABLE IF NOT EXISTS acl (
                id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
                userRoles VARCHAR(255) NOT NULL,
                method VARCHAR(50) NOT NULL DEFAULT 'GET',
                allow ENUM('allow', 'disallow') NOT NULL DEFAULT 'allow',
                route VARCHAR(255) NOT NULL,
                `match` ENUM('true', 'false') NOT NULL DEFAULT 'true',
                comment VARCHAR(500) NOT NULL DEFAULT '',
                UNIQUE KEY unique_acl (userRoles, method, route)
            );
            
            CREATE TABLE IF NOT EXISTS movies (
                id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
                movies_raw JSON NOT NULL
            );
            
            CREATE TABLE IF NOT EXISTS lounges (
	            id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
	            name VARCHAR(20) NOT NULL
            );
            

            CREATE TABLE IF NOT EXISTS viewings(
                id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
	            movie INTEGER NOT NULL,
	            lounge INTEGER NOT NULL,
	            start_time DATETIME NOT NULL
            );

                -- alter so that the movie and lounge is foreign key to other tables
                ALTER TABLE viewings
                ADD FOREIGN KEY(lounge) REFERENCES lounges(id)
                ON UPDATE NO ACTION ON DELETE NO ACTION,
                ADD FOREIGN KEY(movie) REFERENCES movies(id)
                ON UPDATE NO ACTION ON DELETE NO ACTION;

            CREATE TABLE IF NOT EXISTS seats (
	            id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
	            lounge INTEGER NOT NULL,
	            seatRow CHAR(1) NOT NULL,
	            number INTEGER NOT NULL
            );

                -- alter seats for the foreign keys
                ALTER TABLE seats
                ADD FOREIGN KEY(lounge) REFERENCES lounges(id)
                ON UPDATE NO ACTION ON DELETE NO ACTION;


            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                firstName VARCHAR(255) NOT NULL,
                lastName VARCHAR(255),
                created DATETIME DEFAULT (CURDATE()) NOT NULL,
                role VARCHAR(50) NOT NULL DEFAULT 'user',
                password VARCHAR(255) NOT NULL
            );

            CREATE TABLE IF NOT EXISTS bookings (
	            id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
	            BookingReference VARCHAR(255) NOT NULL UNIQUE,
	            user INTEGER,
	            email VARCHAR(255) NOT NULL,
	            viewing INTEGER NOT NULL,
	            status VARCHAR(255) NOT NULL
            );

                -- alter bookings for the foreign keys
                ALTER TABLE bookings
                ADD FOREIGN KEY(user) REFERENCES users(id)
                ON UPDATE NO ACTION ON DELETE NO ACTION,
                ADD FOREIGN KEY(viewing) REFERENCES viewings(id)
                ON UPDATE NO ACTION ON DELETE NO ACTION;
            

            CREATE TABLE IF NOT EXISTS ticketTypes (
	            id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
	            name VARCHAR(50) NOT NULL,
	            price INTEGER NOT NULL
            );
            

            CREATE TABLE IF NOT EXISTS bookingSeats (
	            id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
	            booking INTEGER NOT NULL,
	            seat INTEGER NOT NULL,
	            ticketType INTEGER NOT NULL
            );
                ALTER TABLE bookingSeats
                ADD FOREIGN KEY(booking) REFERENCES bookings(id)
                ON UPDATE NO ACTION ON DELETE NO ACTION,
                ADD FOREIGN KEY(seat) REFERENCES seats(id)
                ON UPDATE NO ACTION ON DELETE NO ACTION,
                ADD FOREIGN KEY(ticketType) REFERENCES ticketTypes(id)
                ON UPDATE NO ACTION ON DELETE NO ACTION;
        ";

        // Execute each statement separately
        foreach (var sql in createTablesSql.Split(';'))
        {
            var trimmed = sql.Trim();
            if (!string.IsNullOrEmpty(trimmed))
            {
                var command = db.CreateCommand();
                command.CommandText = trimmed;
                command.ExecuteNonQuery();
            }
        }
    }

    private static void SeedDataIfEmpty(MySqlConnection db)
    {
        // Check if tables are empty and seed if needed
        var command = db.CreateCommand();

        // Seed ACL rules
        command.CommandText = "SELECT COUNT(*) FROM acl";
        if (Convert.ToInt32(command.ExecuteScalar()) == 0)
        {
            var aclData = @"
                INSERT INTO acl (userRoles, method, allow, route, `match`, comment) VALUES
                ('visitor, user', 'GET', 'disallow', '/secret.html', 'true', 'No access to /secret.html for visitors and normal users'),
                ('visitor,user, admin', 'GET', 'allow', '/api', 'false', 'Allow access to all routes not starting with /api'),
                ('visitor', 'POST', 'allow', '/api/users', 'true', 'Allow registration as new user for visitors'),
                ('visitor, user,admin', '*', 'allow', '/api/login', 'true', 'Allow access to all login routes'),
                ('visitor,user,admin', 'POST', 'allow', '/api/chat', 'true', 'Allow all user roles to access AI chat'),
                ('admin', '*', 'allow', '/api/users', 'true', 'Allow admins to see and edit users'),
                ('admin', '*', 'allow', '/api/sessions', 'true', 'Allow admins to see and edit sessions'),
                ('admin', '*', 'allow', '/api/acl', 'true', 'Allow admins to see and edit acl rules'),
                ('visitor,user,admin', 'GET', 'allow', '/api/movies', 'true', 'Allow all user roles to read movies');
            ";
            command.CommandText = aclData;
            command.ExecuteNonQuery();
        }

        // Seed users
        command.CommandText = "SELECT COUNT(*) FROM users";
        if (Convert.ToInt32(command.ExecuteScalar()) == 0)
        {
            var usersData = @"
                INSERT INTO users (created, email, firstName, lastName, role, password) VALUES
                ('2024-04-02', 'thomas@nodehill.com', 'Thomas', 'Frank', 'admin', '$2a$13$IahRVtN2pxc1Ne1NzJUPpOQO5JCtDZvXpSF.IF8uW85S6VoZKCwZq'),
                ('2024-04-02', 'olle@nodehill.com', 'Olle', 'Olofsson', 'user', '$2a$13$O2Gs3FME3oA1DAzwE0FkOuMAOOAgRyuvNQq937.cl7D.xq0IjgzN.'),
                ('2024-04-02', 'maria@nodehill.com', 'Maria', 'Mårtensson', 'user', '$2a$13$p4sqCN3V3C1wQXspq4eN0eYwK51ypw7NPL6b6O4lMAOyATJtKqjHS');
            ";
            command.CommandText = usersData;
            command.ExecuteNonQuery();
        }

        // Seed movies
        command.CommandText = "SELECT COUNT(*) FROM movies";
        if (Convert.ToInt32(command.ExecuteScalar()) == 0)
        {
            var movieDir = Path.Combine(
                AppContext.BaseDirectory, "..", "..", "..", "public", "movies"
            );

            if (!Directory.Exists(movieDir))
                throw new Exception("Movie directory not found: " + movieDir);

            var files = Directory.GetFiles(movieDir, "*.json");
            if (files.Length == 0){
            throw new Exception("No movie JSON files found in: " + movieDir);
            }

            using var db2 = new MySqlConnection(connectionString);
            db2.Open();

            foreach (var file in files)
            {
                var json = File.ReadAllText(file);

                try
                {
                    // Validera JSON innan insert
                    JSON.Parse(json);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"JSON validation failed for file {file}: {ex.Message}");
                    continue; // hoppa över ogiltiga JSON-filer
                }

                using var cmd = db2.CreateCommand();
                cmd.CommandText = "INSERT INTO movies (movies_raw) VALUES (@json)";
                cmd.Parameters.AddWithValue("@json", json);
                cmd.ExecuteNonQuery();

                Console.WriteLine($"Inserted movie from file: {Path.GetFileName(file)}");
            }
            db2.Close();
        }
    }

    // Helper to create an object from the DataReader
    private static dynamic ObjFromReader(MySqlDataReader reader)
    {
        var obj = Obj();
        for (var i = 0; i < reader.FieldCount; i++)
        {
            var key = reader.GetName(i);
            var value = reader.GetValue(i);

            // Handle NULL values
            if (value == DBNull.Value)
            {
                obj[key] = null;
            }
            // Handle DateTime - convert to ISO string
            else if (value is DateTime dt)
            {
                obj[key] = dt.ToString("yyyy-MM-ddTHH:mm:ss");
            }
            // Handle boolean (MySQL returns sbyte for TINYINT(1))
            else if (value is sbyte sb)
            {
                obj[key] = sb != 0;
            }
            else if (value is bool b)
            {
                obj[key] = b;
            }
            // Handle JSON columns (MySQL returns JSON as string starting with [ or {)
            else if (value is string strValue && (strValue.StartsWith("[") || strValue.StartsWith("{")))
            {
                try
                {
                    obj[key] = JSON.Parse(strValue);
                }
                catch
                {
                    // If parsing fails, keep the original value and try to convert to number
                    obj[key] = strValue.TryToNum();
                }
            }
            else
            {
                // Normal handling - convert to string and try to parse as number
                obj[key] = value.ToString().TryToNum();
            }
        }
        return obj;
    }

    // Run a query - rows are returned as an array of objects
    public static Arr SQLQuery(
        string sql, object parameters = null, HttpContext context = null
    )
    {
        var paras = parameters == null ? Obj() : Obj(parameters);
        using var db = new MySqlConnection(connectionString);
        db.Open();
        var command = db.CreateCommand();
        command.CommandText = @sql;
        var entries = (Arr)paras.GetEntries();
        entries.ForEach(x => command.Parameters.AddWithValue("@" + x[0], x[1]));
        if (context != null)
        {
            DebugLog.Add(context, new
            {
                sqlQuery = sql.Regplace(@"\s+", " "),
                sqlParams = paras
            });
        }
        var rows = Arr();
        try
        {
            if (sql.StartsWith("SELECT ", true, null))
            {
                var reader = command.ExecuteReader();
                while (reader.Read())
                {
                    rows.Push(ObjFromReader(reader));
                }
                reader.Close();
            }
            else
            {
                rows.Push(new
                {
                    command = sql.Split(" ")[0].ToUpper(),
                    rowsAffected = command.ExecuteNonQuery()
                });
            }
        }
        catch (Exception err)
        {
            rows.Push(new { error = err.Message });
        }
        return rows;
    }

    // Run a query - only return the first row, as an object
    public static dynamic SQLQueryOne(
        string sql, object parameters = null, HttpContext context = null
    )
    {
        return SQLQuery(sql, parameters, context)[0];
    }
}
