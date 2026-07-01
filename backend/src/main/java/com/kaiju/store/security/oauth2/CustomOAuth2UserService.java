package com.kaiju.store.security.oauth2;

import com.kaiju.store.enums.Role;
import com.kaiju.store.enums.UserStatus;
import com.kaiju.store.model.User;
import com.kaiju.store.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public CustomOAuth2UserService(UserRepository userRepository,
                                   PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest)
            throws OAuth2AuthenticationException {

        OAuth2User oAuth2User = super.loadUser(userRequest);

        String provider = userRequest
                .getClientRegistration()
                .getRegistrationId();

        processOAuth2User(provider, oAuth2User);

        return oAuth2User;
    }

    private void processOAuth2User(String provider, OAuth2User oAuth2User) {
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = null;
        String name = (String) attributes.get("name");
        String avatar = null;
        String providerId = oAuth2User.getName();

        if ("google".equalsIgnoreCase(provider)) {
            email = (String) attributes.get("email");
            avatar = (String) attributes.get("picture");
        }

        if ("facebook".equalsIgnoreCase(provider)) {
            email = (String) attributes.get("email");

            Object pictureObj = attributes.get("picture");
            if (pictureObj instanceof Map<?, ?> pictureMap) {
                Object dataObj = pictureMap.get("data");
                if (dataObj instanceof Map<?, ?> dataMap) {
                    Object urlObj = dataMap.get("url");
                    if (urlObj != null) {
                        avatar = urlObj.toString();
                    }
                }
            }
        }

        if (email == null || email.isBlank()) {
            email = providerId + "@" + provider.toLowerCase() + ".com";
        }

        if (name == null || name.isBlank()) {
            name = email;
        }

        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            user.setFullName(name);
            user.setAvatarUrl(avatar);
            user.setProvider(provider.toUpperCase());
            user.setProviderId(providerId);

            userRepository.save(user);
            return;
        }
        System.out.println("CUSTOM OAUTH2 USER SERVICE RUNNING");
        User newUser = new User();
        newUser.setEmail(email);
        newUser.setFullName(name);
        newUser.setAvatarUrl(avatar);
        newUser.setProvider(provider.toUpperCase());
        newUser.setProviderId(providerId);
        newUser.setPassword(passwordEncoder.encode("OAUTH2_USER"));
        newUser.setRole(Role.BUYER);
        newUser.setStatus(UserStatus.ACTIVE);

        userRepository.save(newUser);
    }
}