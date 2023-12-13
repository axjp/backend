import connectionDB from "./database";
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

//LOGIN
app.post('/login', (req: any, res: any) => {
  const email = req.body.email;
  const password = req.body.password;

  connectionDB.query(
    'SELECT * FROM login WHERE email = $1 AND password = $2',
    [email, password],
    (error: any, results: any) => {
      if (error) {
        throw error;
      }

      if (results.rows.length > 0) {
        res.json({ success: true, message: 'Usuario encontrado.' });
      } else {
        res.json({ success: false, message: 'Usuario no encontrado.' });
      }
    }
  );
});

// REGISTRO DE USUARIOS 
app.post('/register', (req: any, res: any) => {
  const userData = req.body;

  const {
    name,
    lastname,
    birthdate,
    email,
    password,
    city,
    gender
  } = userData;

  const loginQuery = 'INSERT INTO login (email, password) VALUES ($1, $2) RETURNING idlogin';
  const customerQuery = 'INSERT INTO customer (name, lastname, birthdate, idcity, idgender, idlogin) VALUES ($1, $2, $3, (SELECT idcity FROM city WHERE city = $4), (SELECT idgender FROM gender WHERE gender = $5), $6) RETURNING idcustomer';

  connectionDB.query(loginQuery, [email, password], (loginError: any, loginResults: any) => {
    if (loginError) {
      console.error('Error al insertar en la tabla login:', loginError);
      res.status(500).send('Error interno del servidor');
      return;
    }

    const loginId = loginResults.rows[0].idlogin;

    connectionDB.query(customerQuery, [name, lastname, birthdate, city, gender, loginId], (customerError: any, customerResults: any) => {
      if (customerError) {
        console.error('Error al insertar en la tabla customer:', customerError);
        res.status(500).send('Error interno del servidor');
        return;
      }

      const insertedCustomerId = customerResults.rows[0].idcustomer;

      res.json({ customerId: insertedCustomerId, loginId: loginId });
    });
  });
});

// ESTO ES PARA LAS TABLA DE CUSTOMER
app.get('/register', (_req: any, res: any) => {
  connectionDB.query('SELECT customer.idcustomer, customer.name, customer.lastname, customer.birthdate, \
    login.email, login.password, \
    city.city, customer.idcity, \
    gender.gender, customer.idgender \
    FROM customer \
    INNER JOIN login ON customer.idlogin = login.idlogin \
    INNER JOIN gender ON customer.idgender = gender.idgender \
    INNER JOIN city ON customer.idcity = city.idcity ',
    (error: any, _results: any) => {
      if (error) {
        throw error;
      }
      res.json(_results.rows);
    });
});

//ESTO ES PARA LAS TABLA DE ADMINISTRATOR
app.get('/registeradmin', (_req: any, res: any) => {
  connectionDB.query('SELECT administrator.idadministrator, administrator.name, administrator.lastname, \
    login.email, login.password \
  FROM administrator \
    INNER JOIN login ON administrator.idlogin = login.idlogin',
    (error: any, _results: any) => {
      if (error) {
        throw error;
      }
      res.json(_results.rows);
    });
});

/*
router.post('/', async (req: any, res: any) => {
  const idRole = JSON.parse(req.body.id_role);
  try {
    const newUser = req.body
    const user = await connectionDB.query('INSERT INTO users (cedula, password, email, role_id) VALUES ($1, $2, $3, $4) RETURNING id_user',
      [req.body.cedula, req.body.password, req.body.email, idRole]);

    const newUserId = {
      id_user: user.rows[0].id_user,
      ...newUser
    }
    res.send(newUserId);
  } catch (error) {
    res.send('Error al crear el usuario');
    console.log(error)
  }
});*/

/*app.post('/register', (_req: any, res: any) => {
  const data = _req.body;

  connectionDB.query('insert into customer(name, lastname, email, password) values ($1,$2,$3,$4)', [data.name, data.lastname, data.email, data.password],
    (error: any, _results: any) => {
      if (error) {
        throw error;
      }
      res.json("Registro Creado")
    });
});*/


/*app.post('/register', (_req: any, res: any) => {
  const data = _req.body;

  // Primero, insertamos en la tabla 'gender'
  connectionDB.query('INSERT INTO gender (gender) VALUES ($1)', [data.gender], (error: any, genderResults: any) => {
    if (error) {
      throw error;
    }

    const genderId = genderResults.insertId; // ID generado para el género insertado

    // Segundo, insertamos en la tabla 'city'
    connectionDB.query('INSERT INTO city (city) VALUES ($1)', [data.city], (error: any, cityResults: any) => {
      if (error) {
        throw error;
      }

      const cityId = cityResults.insertId; // ID generado para la ciudad insertada

      // Tercero, insertamos en la tabla 'login'
      connectionDB.query('INSERT INTO login (email, password) VALUES ($1, $2)', [data.email, data.password], (error: any, loginResults: any) => {
        if (error) {
          throw error;
        }

        const loginId = loginResults.insertId; // ID generado para el login insertado

        // Finalmente, insertamos en la tabla 'customer' con los IDs relacionados
        connectionDB.query('INSERT INTO customer (name, lastname, birthdate, idgender, idcity, idlogin) VALUES ($1, $2, $3, $4, $5, $6)', [data.name, data.lastname, data.birthdate, genderId, cityId, loginId], (error: any, customerResults: any) => {
          if (error) {
            throw error;
          }

          res.json("Registro Creado");
        });
      });
    });
  });
});*/

/*app.post('/register', (req: Request, res: Response) => {
  const data = req.body as UserRegistrationData; // Type cast to UserRegistrationData

  // Insert into the "gender" table
  connectionDB.query('INSERT INTO gender (gender) VALUES ($1)', [data.gender], (error: any, genderResults: any) => {
    if (error) {
      throw error;
    }

    const genderId = genderResults.insertId; // ID generated for the inserted gender

    // Insert into the "city" table
    connectionDB.query('INSERT INTO city (city) VALUES ($1)', [data.city], (error: any, cityResults: any) => {
      if (error) {
        throw error;
      }

      const cityId = cityResults.insertId; // ID generated for the inserted city

      // Insert into the "login" table
      connectionDB.query('INSERT INTO login (email, password) VALUES ($1, $2)', [data.email, data.password], (error: any, loginResults: any) => {
        if (error) {
          throw error;
        }

        const loginId = loginResults.insertId; // ID generated for the inserted login

        // Finally, insert into the "customer" table with related IDs
        connectionDB.query('INSERT INTO customer (name, lastname, birthdate, idgender, idcity, idlogin) VALUES ($1, $2, $3, $4, $5, $6)',
          [data.name, data.lastname, data.birthdate, genderId, cityId, loginId],
          (error: any, customerResults: any) => {
            if (error) {
              throw error;
            }

            res.json("Registro Creado");
          });
      });
    });
  });
});

// User registration data interface
interface UserRegistrationData {
  gender: string;
  city: string;
  email: string;
  password: string;
  name: string;
  lastname: string;
  birthdate: Date;
}

*/



app.delete('/register/:idcustomer', (_req: any, res: any) => {
  const data = _req.params;

  connectionDB.query('delete from customer where idcustomer = $1', [data.idcustomer],
    (error: any, _results: any) => {
      if (error) {
        throw error;
      }
      res.json("Registro Eliminado");
    });
});

app.put('/register/:idcustomer', (_req: any, res: any) => {
  const data = _req.body;
  const id = _req.params.idcustomer;

  connectionDB.query('update customer set name = $1, lastname = $2, email = $3, password = $4 where idcustomer = $5',
    [data.name, data.lastname, data.email, data.password, id],
    (error: any, _results: any) => {
      if (error) {
        throw error;
      }
      res.json("Registro Actualizado");
    });
});


//PARA QUE TRAIGA LOS DATOS EN EL FORMULARIO
app.get('/register/:idcustomer', (_req: any, res: any) => {
  const data = _req.params;

  connectionDB.query('select * from customer where idcustomer = $1', [data.idcustomer],
    (error: any, _results: any) => {
      if (error) {
        throw error;
      }
      if (_results.rowCount > 0) {
        res.json(_results.rows[0]);
      } else {
        res.json('NO HAY');
      }
    });
});

/*app.put('/register/:idcustomer', (_req:any, res:any) => {
  const data = _req.body;

  connectionDB.query('update customer set name = $1, lastname = $2, email = $3, birthdate = $4 where idcustomer = $5', [data.name, data.lastname, data.email, data.birthdate, data.idcustomer],
    (error: any, _results: any) => {
      if (error) {
        throw error;
      }
      res.json("Registro Actualizado");
    });
});
  


/*app.post("/cats", (_req,res:))
const*_req.body;
connectionDB.query(insert into Cats(name,ago) CSSFontFeatureValuesRule($1,$2),values[data.name,data.age]),
;

app.delete(path:'/register/:id',(req,res))

app.post('/login', (req: any, res: any) => {
  const usuario = req.body.usuario;
  const password = req.body.password;

  connectionDB.query(
    'SELECT * FROM usuarios WHERE usuario = $1 AND password = $2',
    [usuario, password],
    (error: any, results: any) => {
      if (error) {
        throw error;
      }

      if (results.rows.length > 0) {
        const usuario = results.rows[0];
        if (usuario.estado) {
          res.json({ success: true });
        } else {
          res.json({ success: false, message: 'El usuario está desactivado.' });
        }
      } else {
        res.json({ success: false, message: 'Credenciales incorrectas.' });
      }
    }
  );
});

app.get("/registros", (req: any, res: any) => {
  connectionDB.query("SELECT * FROM usuarios", (error: any, results: any) => {
    if (error) {
      throw error;
    }
    res.send(results.rows);
  });
});

app.post("/registros", (req: any, res: any) => {
  connectionDB.query(
    "INSERT INTO usuarios (usuario, password, estado) VALUES ($1, $2, true)",
    [req.body.usuario, req.body.password],
    (error: any, results: any) => {
      if (error) {
        throw error;
      }
      res.json('Creado');
    }
  );
});

app.get("/registros/:id", (req: any, res: any) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'ID no válido' });
    return;
  }

  connectionDB.query("SELECT * FROM usuarios WHERE id=$1", [id], (error: any, results: any) => {
    if (error) {
      throw error;
    }

    if (results.rows.length > 0) {
      res.json(results.rows[0]);
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  });
});

app.delete("/registros/:id", (req: any, res: any) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'ID no válido' });
    return;
  }

  connectionDB.query("DELETE FROM usuarios WHERE id=$1", [id], (error: any, results: any) => {
    if (error) {
      throw error;
    }

    if (results.rowCount > 0) {
      res.json('Eliminado');
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  });
});

app.put("/registros/:id/estado", (req: any, res: any) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'ID no válido' });
    return;
  }

  const nuevoEstado = req.body.estado;

  connectionDB.query("UPDATE usuarios SET estado=$1 WHERE id=$2", [nuevoEstado, id], (error: any, results: any) => {
    if (error) {
      throw error;
    }

    if (results.rowCount > 0) {
      res.json('Estado actualizado correctamente');
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  });
});

app.get("/registrar", (req: any, res: any) => {
  connectionDB.query("SELECT * FROM flor", (error: any, results: any) => {
    if (error) {
      throw error;
    }
    res.send(results.rows);
  });
});

app.post("/registrar", (req: any, res: any) => {
  connectionDB.query(
    "INSERT INTO flor (nombre, precio, stock, imagen) VALUES ($1, $2, $3, $4)",
    [req.body.nombre, req.body.precio, req.body.stock, req.body.imagen],
    (error: any, results: any) => {
      if (error) {
        throw error;
      }
      res.json('Creado');
    }
  );
});

app.put("/registrar/:idflor", (req: any, res: any) => {
  const idflor = parseInt(req.params.idflor);
  if (isNaN(idflor)) {
    res.status(400).json({ error: 'ID no válido' });
    return;
  }

  connectionDB.query(
    "UPDATE flor SET nombre=$1, precio=$2, stock=$3, imagen=$4 WHERE idflor=$5",
    [req.body.nombre, req.body.precio, req.body.stock, req.body.imagen, idflor],
    (error: any, results: any) => {
      if (error) {
        throw error;
      }

      if (results.rowCount > 0) {
        res.json('Actualizado');
      } else {
        res.status(404).json({ error: 'Flor no encontrada' });
      }
    }
  );
});
/*eso para eliminar 
app.get("/registrar/:idflor", (req: any, res: any) => {
  const idflor = parseInt(req.params.idflor);
  if (isNaN(idflor)) {
    res.status(400).json({ error: 'ID no válido' });
    return;
  }

  connectionDB.query("SELECT * FROM flor WHERE idflor=$1", [idflor], (error: any, results: any) => {
    if (error) {
      throw error;
    }

    if (results.rows.length > 0) {
      res.json(results.rows[0]);
    } else {
      res.status(404).json({ error: 'Flor no encontrada' });
    }
  });
});

app.delete("/registrar/:idflor", (req: any, res: any) => {
  const idflor = parseInt(req.params.idflor);
  if (isNaN(idflor)) {
    res.status(400).json({ error: 'ID no válido' });
    return;
  }

  connectionDB.query("DELETE FROM flor WHERE idflor=$1", [idflor], (error: any, results: any) => {
    if (error) {
      throw error;
    }

    if (results.rowCount > 0) {
      res.json('Eliminado');
    } else {
      res.status(404).json({ error: 'Flor no encontrada' });
    }
  });
});*/

app.listen(3000, () => console.log(`Servidor en el puerto ${3000}`));
