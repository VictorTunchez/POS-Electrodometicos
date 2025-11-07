package pos.api.controller;

import jakarta.validation.Valid;
import pos.api.domain.usuario.login.AutenticacionDto;
import pos.api.domain.usuario.Usuario;
import pos.api.infra.security.TokeJwtDto;
import pos.api.infra.security.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pos.api.domain.usuario.login.AutenticacionService;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AutenticacionUsuarioController {

    @Autowired
    private TokenService tokenService;

    @Autowired
    private AutenticacionService autenticacionService;

    @PostMapping("/login")
    public ResponseEntity iniciarSesion(@RequestBody @Valid AutenticacionDto datos){
        // Valida credenciales y actualiza lastPasswordChange
        Usuario usuario = autenticacionService.login(datos.email(), datos.contrasena());

        // Genera token JWT
        var tokenJwt = tokenService.generarToken(usuario);
        return ResponseEntity.ok(new TokeJwtDto(tokenJwt));
    }
}

