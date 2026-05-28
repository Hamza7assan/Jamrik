package com.example.demo.configurations;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final com.example.demo.repositories.JamrikRepository jamrikRepo;
    public SecurityConfig(com.example.demo.repositories.JamrikRepository jamrikRepo) {
        this.jamrikRepo = jamrikRepo;
    }
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
        //Tells Spring Security to check WebConfig mappings for CORS rules
        .cors(Customizer.withDefaults())
        .csrf(csrf->csrf.disable())
        .authorizeHttpRequests(auth->auth
         .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
         .requestMatchers("/jamrik/register").permitAll()
         .requestMatchers("/api/ai/**").permitAll()
         .requestMatchers("/jamrik/codes/validate").permitAll()
         .anyRequest().authenticated()
          )
          //Configure Form Login to handle React API requests
          .formLogin(form->form
          .loginProcessingUrl("/jamrik/login")
          .successHandler((request, response,
                           authentication)->{
          response.setStatus(HttpServletResponse.SC_OK);
          response.setContentType("application/json");
          com.example.demo.classes.User user = jamrikRepo.findByUserName(authentication.getName()).orElse(null);
          if (user != null) {
              String json = String.format("{\"id\":\"%d\",\"userName\":\"%s\",\"email\":\"%s\",\"role\":\"%s\",\"avatar\":\"%s\"}", user.getId(), user.getUserName(), user.getEmail(), user.getRole(), user.getAvatar());
              response.getWriter().write(json);
          } else {
              response.getWriter().write("{\"message\": \"Login successful\"}");
          }
          })
          .failureHandler((request,response,
                           exception)->{
          response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
          response.setContentType("application/json");
          response.getWriter().write("{\"error\": \"Invalid credentials\"}");
          })
          .permitAll()
          )
          //Configure Logout to return 200 OK instead of a 302 redirect
          .logout(logout->logout
           .logoutUrl("/jamrik/logout")
           .logoutSuccessHandler((request, response,
                                  authentication)->{
           response.setStatus(HttpServletResponse.SC_OK);
           response.setContentType("application/json");
           response.getWriter().write("{\"message\": \"Logout successful\"}");
           })
           .permitAll()
           );
        return http.build();
    }
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}