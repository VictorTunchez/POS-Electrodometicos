package pos.api.controller;

import jakarta.validation.Valid;
import pos.api.domain.usuario.autenticacion.AutenticacionDto;
import pos.api.domain.usuario.Usuario;
import pos.api.infra.security.TokeJwtDto;
import pos.api.infra.security.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/login")
@CrossOrigin(origins = "http://localhost:5173")
public class AutenticacionUsuarioController {
    @Autowired
    private TokenService tokenService;

    @Autowired
    private AuthenticationManager manager;

    @PostMapping
    public ResponseEntity iniciarSeseion(@RequestBody @Valid AutenticacionDto datos){
        var autenticationToken = new UsernamePasswordAuthenticationToken(datos.login(), datos.contrasena());
        var autenticacion = manager.authenticate(autenticationToken);

        var tokenJwt = tokenService.generarToken((Usuario) autenticacion.getPrincipal());
        return  ResponseEntity.ok( new TokeJwtDto(tokenJwt));
    }

}
