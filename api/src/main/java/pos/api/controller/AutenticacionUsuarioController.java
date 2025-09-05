package pos.api.controller;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import pos.api.domain.user.login.AutenticacionDto;
import pos.api.domain.user.Usuario;
import pos.api.infra.security.TokeJwtDto;
import pos.api.infra.security.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pos.api.domain.user.login.AutenticacionService;

@RestController
@RequestMapping("/login")
@CrossOrigin(origins = "*")
public class AutenticacionUsuarioController {

    @Autowired
    private TokenService tokenService;

    @Autowired
    private AutenticacionService autenticacionService;

    @PostMapping
    public ResponseEntity iniciarSesion(@RequestBody @Valid AutenticacionDto datos){
        // Valida credenciales y actualiza lastPasswordChange
        Usuario usuario = autenticacionService.login(datos.email(), datos.contrasena());

        // Genera token JWT
        var tokenJwt = tokenService.generarToken(usuario);
        return ResponseEntity.ok(new TokeJwtDto(tokenJwt));
    }
}

