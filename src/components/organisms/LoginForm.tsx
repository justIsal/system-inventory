import { useForm } from '@tanstack/react-form';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { useLogin } from '@/hooks/useLogin';
import { Alert } from '@/components/molecules/Alert';
import { AlertCircle } from 'lucide-react';

export const LoginForm = ({ 
    redirectPath = '/', 
    expectedRole 
}: { 
    redirectPath?: string, 
    expectedRole?: 'admin' | 'staff_gudang' 
}) => {
    const { handleLogin, isLoading, error } = useLogin(redirectPath, expectedRole);

    const form = useForm({
        defaultValues: {
            username: '',
            password: '',
        },
        onSubmit: async ({ value }) => {
            await handleLogin(value.username, value.password);
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
                        onChange: ({ value }) => !value ? 'Username is required' : undefined,
                    }}
                    children={(field) => (
                        <Input
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            error={field.state.meta.errors?.length ? field.state.meta.errors.join(', ') : undefined}
                            placeholder="Enter your username"
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
                        onChange: ({ value }) => !value ? 'Password is required' : undefined,
                    }}
                    children={(field) => (
                        <Input
                            type="password"
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            error={field.state.meta.errors?.length ? field.state.meta.errors.join(', ') : undefined}
                            placeholder="Enter your password"
                        />
                    )}
                />
            </div>

            <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                    <Button type="submit" isLoading={isSubmitting || isLoading} disabled={!canSubmit}>
                        Sign In
                    </Button>
                )}
            />
        </form>
    );
};
