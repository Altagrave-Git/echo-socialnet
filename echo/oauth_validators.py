from oauth2_provider.oauth2_validators import OAuth2Validator
from .settings import BASE_URL
from oauth2_provider.models import clear_expired

class CustomOAuth2Validator(OAuth2Validator):
    oidc_claim_scope = None

    def get_additional_claims(self, request):
        clear_expired()
        return {
            "given_name": request.user.first_name,
            "family_name": request.user.last_name,
            "email": request.user.email,
            "preferred_username": request.user.username,
            "picture":  BASE_URL + request.user.avatar.url,
        }
    
    def get_userinfo_claims(self, request):
        claims = super().get_userinfo_claims(request)
        claims.update(self.get_additional_claims(request))
        return claims
    