from .models import CustomUser
from rest_framework import serializers

class RegistroSerializer(serializers.ModelSerializer):
    confirmPassword = serializers.CharField(
        write_only=True,
        required=True
    )
    class Meta:
        model = CustomUser
        fields = ('email', 'data_nascimento', 'first_name', 'last_name', 'password', 'confirmPassword')
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, attrs):
        password = attrs.get('password')
        confirmPassword = attrs.get('confirmPassword')

        if password != confirmPassword:
            raise serializers.ValidationError({
                'confirmPassword': 'As senhas não coincidem'
            })

        return attrs

    def create(self, validated_data):
        validated_data.pop('confirmPassword')

        password = validated_data.pop('password')

        user = CustomUser.objects.create_user(
            password=password,
            **validated_data
        )

        return user

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('email', 'data_nascimento', 'first_name', 'last_name')