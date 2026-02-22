import { useForm } from '@tanstack/react-form';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { useRegister } from '@/hooks/useRegister';
import { Alert } from '@/components/molecules/Alert';
import { AlertCircle } from 'lucide-react';

export const RegisterForm = () => {
    const { handleRegister, isLoading, error } = useRegister();

    const form = useForm({
        defaultValues: {
            username: '',
            password: '',
        },
        onSubmit: async ({ value }) => {
            await handleRegister(value.username, value.password);
        },
    });

    return (
        <form 
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }}
            className="space-y-6"
        >
            {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <p className="ml-2">{error}</p>
                </Alert>
            )}

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Username
                </label>
                <form.Field
                    name="username"
                    validators={{
                        onChange: ({ value }) => value.length < 3 ? 'Username must be at least 3 characters' : undefined,
                    }}
                    children={(field) => (
                        <Input
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            error={field.state.meta.errors?.length ? field.state.meta.errors.join(', ') : undefined}
                            placeholder="Create a new username"
                        />
                    )}
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Password
                </label>
                <form.Field
                    name="password"
                    validators={{
                        onChange: ({ value }) => value.length < 6 ? 'Password must be at least 6 characters' : undefined,
                    }}
                    children={(field) => (
                        <Input
                            type="password"
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            error={field.state.meta.errors?.length ? field.state.meta.errors.join(', ') : undefined}
                            placeholder="Create a password (min 6 chars)"
                        />
                    )}
                />
            </div>

            <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                    <Button type="submit" isLoading={isSubmitting || isLoading} disabled={!canSubmit}>
                        Register Account
                    </Button>
                )}
            />
        </form>
    );
};
